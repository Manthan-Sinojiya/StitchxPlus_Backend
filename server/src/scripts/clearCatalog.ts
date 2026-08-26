import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stitchx_db';

import {
  ProductModel,
  CategoryModel,
  FabricModel,
  CustomizationOptionModel,
  CouponModel
} from '../models/index.js';

async function clearCatalogData() {
  console.log('\n=============================================================');
  console.log('🗑️  STITCHX PLUS LLC — CLEAR CATALOG & DATABASE SCRIPT');
  console.log('=============================================================\n');

  try {
    console.log(`📡 Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connection established.\n');

    console.log('🧹 Deleting all Product records...');
    const prodRes = await ProductModel.deleteMany({});
    console.log(`✅ Deleted ${prodRes.deletedCount} products.`);

    console.log('🧹 Deleting all Category records...');
    const catRes = await CategoryModel.deleteMany({});
    console.log(`✅ Deleted ${catRes.deletedCount} categories.`);

    console.log('🧹 Deleting all Fabric records...');
    const fabRes = await FabricModel.deleteMany({});
    console.log(`✅ Deleted ${fabRes.deletedCount} fabrics.`);

    console.log('🧹 Deleting all Customization Option records...');
    const custRes = await CustomizationOptionModel.deleteMany({});
    console.log(`✅ Deleted ${custRes.deletedCount} customization option groups.`);

    console.log('🧹 Deleting all Coupon records...');
    const coupRes = await CouponModel.deleteMany({});
    console.log(`✅ Deleted ${coupRes.deletedCount} coupons.`);

    console.log('\n=============================================================');
    console.log('🎉 ALL CATALOG DATA (Products, Categories, Fabrics, Customizations) HAS BEEN REMOVED SUCCESSFULLY!');
    console.log('=============================================================\n');
  } catch (error) {
    console.error('❌ Error clearing catalog data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

clearCatalogData();
