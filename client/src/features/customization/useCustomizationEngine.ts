import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customizationService } from '../../services/customizationService';
import { patternService } from '../../services/patternService';
import { useAuthStore } from '../../store/useAuthStore';
import {
  CustomizationOptionGroup,
  CustomizationPriceResponse,
  CustomizationValidateResponse,
  MeasurementProfile,
} from '@stitchx/shared';

export function useCustomizationEngine(productSlugParam?: string) {
  const productIdentifier = productSlugParam || 'default';
  const { isAuthenticated } = useAuthStore();

  // 1. Fetch Option Groups from Backend API
  const {
    data: customizationData,
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
  } = useQuery({
    queryKey: ['customizationOptions', productIdentifier],
    queryFn: async () => {
      const res = await customizationService.getCustomizationOptions(productIdentifier);
      if (!res.success || !res.data) {
        throw new Error(res.error?.message || 'Failed to load customization options');
      }
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // 2. Fetch User Patterns if logged in
  const { data: userPatterns } = useQuery({
    queryKey: ['userPatterns'],
    queryFn: async () => {
      const res = await patternService.getPatterns();
      return res.success ? res.data || [] : [];
    },
    enabled: isAuthenticated,
  });

  const groups = customizationData?.groups || [];
  const targetProduct = customizationData?.product || null;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedPatternSnapshot, setSelectedPatternSnapshot] = useState<MeasurementProfile | null>(
    null,
  );
  const [priceData, setPriceData] = useState<CustomizationPriceResponse | null>(null);
  const [validationData, setValidationData] = useState<CustomizationValidateResponse | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  // Initialize selectedOptions with first option of each group when loaded
  useEffect(() => {
    if (groups.length > 0 && Object.keys(selectedOptions).length === 0) {
      const initialMap: Record<string, string> = {};
      groups.forEach((group) => {
        if (group.options.length > 0) {
          initialMap[group.groupCode] = group.options[0].code;
        }
      });
      setSelectedOptions(initialMap);
    }
  }, [groups]);

  // Set default measurement pattern snapshot if available
  useEffect(() => {
    if (userPatterns && userPatterns.length > 0 && !selectedPatternSnapshot) {
      const defaultPattern = userPatterns.find((p) => p.isDefault) || userPatterns[0];
      // Store full snapshot object so it survives future edits!
      setSelectedPatternSnapshot({ ...defaultPattern });
    }
  }, [userPatterns, selectedPatternSnapshot]);

  // Debounced Live Price & Validation calculation
  useEffect(() => {
    if (Object.keys(selectedOptions).length === 0) return;

    setIsCalculatingPrice(true);
    const timer = setTimeout(async () => {
      try {
        const [priceRes, valRes] = await Promise.all([
          customizationService.calculatePrice({
            productId: targetProduct?.id,
            productSlug: targetProduct?.slug || productIdentifier,
            selectedOptions,
          }),
          customizationService.validateConfig({
            productId: targetProduct?.id,
            productSlug: targetProduct?.slug || productIdentifier,
            selectedOptions,
          }),
        ]);

        if (priceRes.success && priceRes.data) {
          setPriceData(priceRes.data);
        }
        if (valRes.success && valRes.data) {
          setValidationData(valRes.data);
        }
      } catch (err) {
        console.error('Failed to update live pricing or validation', err);
      } finally {
        setIsCalculatingPrice(false);
      }
    }, 250); // 250ms debounce

    return () => clearTimeout(timer);
  }, [selectedOptions, targetProduct, productIdentifier]);

  // Step Management
  // Total steps: Option Groups + Measurement Pattern Selection Step + Final Review Step
  const totalSteps = groups.length + 2;
  const isMeasurementStep = currentStepIndex === groups.length;
  const isReviewStep = currentStepIndex === groups.length + 1;
  const currentGroup: CustomizationOptionGroup | undefined = groups[currentStepIndex];

  const selectOption = (groupCode: string, optionCode: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupCode]: optionCode,
    }));
  };

  const selectPatternSnapshot = (pattern: MeasurementProfile) => {
    // Store full measurement snapshot
    setSelectedPatternSnapshot({ ...pattern });
  };

  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
    }
  };

  return {
    groups,
    targetProduct,
    userPatterns: userPatterns || [],
    isLoadingGroups,
    isErrorGroups,
    currentStepIndex,
    totalSteps,
    isMeasurementStep,
    isReviewStep,
    currentGroup,
    selectedOptions,
    selectedPatternSnapshot,
    priceData,
    validationData,
    isCalculatingPrice,
    selectOption,
    selectPatternSnapshot,
    nextStep,
    prevStep,
    goToStep,
  };
}
