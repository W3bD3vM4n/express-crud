import { AppDataSource } from '../data-source.js';
import { Category } from '../entities/category.js';
import { CreateCategoryZod, GetCategoryZod, UpdateCategoryZod } from '../schemas/category.schema.js';
import { Not } from 'typeorm';

const categoryRepository = AppDataSource.getRepository(Category);

// Convert the Entity to the CategoryResponse type
const toCategoryResponse = (category: Category): GetCategoryZod => {
    return {
        categoryId: category.categoryId,
        name: category.name,
        description: category.description ?? null,
    };
};

export class CategoryService {
    // CREATE
    async createFromZod(create: CreateCategoryZod): Promise<GetCategoryZod> {
        // Prevent duplicate category names
        const existing = await categoryRepository.findOne({
            where: {
                name: create.name
            }
        });

        if (existing) {
            throw new Error('A category with this name already exists');
        }

        // Build a data object conditionally
        const categoryData: { name: string; description?: string } = {
            name: create.name
        };

        // Only add description if it's a non-null value
        if (create.description != null) {
            categoryData.description = create.description;
        }

        const category = categoryRepository.create(categoryData);

        const newCategory = await categoryRepository.save(category);
        return toCategoryResponse(newCategory);
    }

    // READ
    async getAllFromZod(): Promise<GetCategoryZod[]> {
        const categories = await categoryRepository.find();
        return categories.map(toCategoryResponse);
    }

    async getByIdFromZod(id: number): Promise<GetCategoryZod | null> {
        const category = await categoryRepository.findOneBy({ categoryId: id });
        return category ? toCategoryResponse(category) : null;
    }

    // UPDATE
    async updateFromZod(id: number, update: UpdateCategoryZod): Promise<GetCategoryZod | null> {
        const category = await categoryRepository.findOneBy({ categoryId: id });
        if (!category) return null;

        // If name is being changed, check for uniqueness against other categories
        if (update.name) {
            const existing = await categoryRepository.findOne({
                where: {
                    name: update.name,
                    categoryId: Not(id)
                }
            });

            if (existing) {
                throw new Error('Another category with this name already exists');
            }
        }

        // Build update data conditionally
        const updateData: { name?: string; description?: string } = {};

        if (update.name !== undefined) {
            updateData.name = update.name;
        }

        if (update.description !== undefined && update.description !== null) {
            updateData.description = update.description;
        }

        // Merge the updates into the existing category entity
        Object.assign(category, updateData);

        const updatedCategory = await categoryRepository.save(category);
        return toCategoryResponse(updatedCategory);
    }

    // DELETE
    async deleteFromZod(id: number) {
        const result = await categoryRepository.delete(id);
        return result;
    }
}