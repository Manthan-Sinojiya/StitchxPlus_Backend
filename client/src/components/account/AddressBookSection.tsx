import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Edit2, Star } from 'lucide-react';
import { Button, Input, Modal, Badge, useToast, Loader } from '../ui';
import { userService } from '../../services/userService';
import { UserAddressBookEntry } from '@stitchx/shared';

export function AddressBookSection() {
  const [addresses, setAddresses] = useState<UserAddressBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddressBookEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    label: 'Home',
    firstName: '',
    lastName: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await userService.getAddresses();
      setAddresses(data);
    } catch (_err) {
      toast('error', 'Error', 'Failed to load address book.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      label: 'Home',
      firstName: '',
      lastName: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr: UserAddressBookEntry) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label || 'Home',
      firstName: addr.firstName || '',
      lastName: addr.lastName || '',
      street: addr.street || '',
      apartment: addr.apartment || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || '',
      country: addr.country || 'United States',
      phone: addr.phone || '',
      isDefault: addr.isDefault || false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingAddress) {
        const id = editingAddress._id || editingAddress.id || '';
        const updated = await userService.updateAddress(id, formData);
        setAddresses(updated);
        toast('success', 'Address Updated', 'Address has been successfully updated.');
      } else {
        const updated = await userService.addAddress(formData);
        setAddresses(updated);
        toast('success', 'Address Added', 'New delivery address added to your profile.');
      }
      setIsModalOpen(false);
    } catch (_err) {
      toast('error', 'Error', 'Failed to save address.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const updated = await userService.deleteAddress(id);
      setAddresses(updated);
      toast('info', 'Address Removed', 'Address removed from your address book.');
    } catch (_err) {
      toast('error', 'Error', 'Failed to delete address.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await userService.updateAddress(id, { isDefault: true });
      setAddresses(updated);
      toast('success', 'Default Address Set', 'Default shipping address updated.');
    } catch (_err) {
      toast('error', 'Error', 'Failed to set default address.');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col justify-center items-center gap-3">
        <Loader size="lg" />
        <span className="text-xs text-navy-600 font-semibold">Loading address book...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif font-bold text-navy-900">Address Book</h3>
          <p className="text-xs text-navy-600">Save delivery locations for quick checkout.</p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="py-12 text-center space-y-4 border border-dashed border-navy-200 rounded-2xl bg-cream-50/40">
          <div className="w-12 h-12 rounded-full bg-navy-50 text-navy-400 mx-auto flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-navy-900">No Saved Addresses</h4>
          <p className="text-xs text-navy-600 max-w-sm mx-auto">
            You have not added any delivery addresses yet. Add your primary residence or office address.
          </p>
          <Button variant="outline" size="sm" onClick={openAddModal}>
            Add Address Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const id = addr._id || addr.id || '';
            return (
              <div
                key={id}
                className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                  addr.isDefault
                    ? 'border-gold-500 bg-gold-500/5 shadow-sm'
                    : 'border-navy-100 bg-white hover:border-navy-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-navy-900">{addr.label || 'Address'}</span>
                    {addr.isDefault && (
                      <Badge variant="gold" className="text-[10px] uppercase font-bold tracking-wider">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-1.5 text-navy-500 hover:text-gold-600 rounded-lg hover:bg-navy-50 transition-colors"
                      title="Edit address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="p-1.5 text-navy-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-navy-700 space-y-0.5">
                  <p className="font-semibold text-navy-900">
                    {addr.firstName} {addr.lastName}
                  </p>
                  <p>{addr.street}</p>
                  {addr.apartment && <p>{addr.apartment}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                  <p>{addr.country}</p>
                  <p className="text-navy-500 pt-1">Phone: {addr.phone}</p>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(id)}
                    className="text-xs text-gold-600 font-semibold hover:text-gold-700 flex items-center gap-1 pt-1"
                  >
                    <Star className="w-3.5 h-3.5" /> Set as Default
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Address Label (e.g. Home, Office, Estate)"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Street Address"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            required
          />

          <Input
            label="Apartment, Suite, Unit (Optional)"
            value={formData.apartment}
            onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
            <Input
              label="State / Province"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
            <Input
              label="Postal / Zip Code"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-navy-900 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded border-navy-300 text-gold-500 focus:ring-gold-500"
            />
            Set as default shipping address
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={submitting}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
