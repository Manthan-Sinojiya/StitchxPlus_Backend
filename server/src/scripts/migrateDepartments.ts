import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CategoryModel } from '../models/category.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stitchxplus';

async function migrateDepartments() {
  try {
    console.log('Connecting to MongoDB for Department Migration...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Check if top-level "Men" department exists
    let menDepartment = await CategoryModel.findOne({
      $or: [
        { slug: 'men' },
        { name: /^men$/i, isTopLevel: true },
      ],
    });

    if (!menDepartment) {
      console.log('Creating top-level "Men" department...');
      menDepartment = await CategoryModel.create({
        name: 'Men',
        slug: 'men',
        description: 'Bespoke menswear suiting, shirts, trousers, outerwear, and accessories.',
        isTopLevel: true,
        type: 'department',
        parentCategory: null,
        sortOrder: 1,
        isActive: true,
      });
      console.log(`Created "Men" Department with ID: ${menDepartment._id}`);
    } else {
      console.log(`Found existing "Men" department: ${menDepartment._id}`);
      if (!menDepartment.isTopLevel || menDepartment.type !== 'department') {
        menDepartment.isTopLevel = true;
        menDepartment.type = 'department';
        await menDepartment.save();
        console.log('Updated "Men" category to be top-level department.');
      }
    }

    // 2. Find all categories that do NOT have a parentCategory and are not top-level departments
    const orphanCategories = await CategoryModel.find({
      _id: { $ne: menDepartment._id },
      $or: [
        { parentCategory: null },
        { parentCategory: { $exists: false } },
      ],
      isTopLevel: { $ne: true },
    });

    console.log(`Found ${orphanCategories.length} categories to scope under "Men" department.`);

    for (const cat of orphanCategories) {
      cat.parentCategory = menDepartment._id as any;
      cat.isTopLevel = false;
      cat.type = 'category';
      await cat.save();
      console.log(`Scoped Category "${cat.name}" (${cat.slug}) -> Men Department.`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDepartments();
