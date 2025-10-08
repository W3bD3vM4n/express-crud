import { Request, Response } from 'express';
import { PostService } from '../services/post.service.js';
import { PostStatus } from '../entities/user.js';

const postService = new PostService();

export class PostController {
    // CREATE
    async createPost(req: Request, res: Response) {
        try {
            // Validate that user is authenticated
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const userId = req.user.userId;
            const post = await postService.createFromZod(req.body, userId);
            res.status(201).json(post);
        } catch (error: any) {
            res.status(400).json({ message: 'Error creating post', error: error.message });
        }
    }

    // READ
    async getAllPosts(req: Request, res: Response) {
        try {
            // Build options object conditionally
            const options: { categoryId?: number } = {};

            // Properly handle query parameter
            if (req.query.category) {
                const categoryParam = req.query.category;

                // Ensure it's a string (not an array or ParsedQs object)
                if (typeof categoryParam !== 'string') {
                    return res.status(400).json({ message: 'Invalid category ID format' });
                }

                const parsed = parseInt(categoryParam, 10);

                if (isNaN(parsed)) {
                    return res.status(400).json({ message: 'Invalid category ID format' });
                }

                options.categoryId = parsed;
            }

            const posts = await postService.getAllFromZod(options);
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching public posts', error: error.message });
        }
    }

    async getSpecificUserPosts(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const userId = req.user.userId;
            const posts = await postService.getSpecificUserFromZod(userId);
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching your posts', error: error.message });
        }
    }

    // DELETE
    async deletePost(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const idParam = req.params.id;

            if (!idParam) {
                return res.status(400).json({ message: 'Post ID is required' });
            }

            const postId = parseInt(idParam, 10);

            if (isNaN(postId)) {
                return res.status(400).json({ message: 'Invalid post ID format' });
            }

            const { userId, role } = req.user;
            const success = await postService.deleteFromZod(postId, userId, role);

            if (!success) {
                return res.status(404).json({ message: 'Post not found' });
            }
            res.status(204).send();
        } catch (error: any) {
            // Catches the specific "Forbidden" error from the service
            if (error.message.includes('Forbidden')) {
                return res.status(403).json({ message: error.message });
            }

            if (error.message.includes('Post not found')) {
                return res.status(404).json({ message: error.message });
            }

            res.status(500).json({ message: 'Error deleting post', error: error.message });
        }
    }

    // ADMIN METHODS
    async getPending(req: Request, res: Response) {
        try {
            const posts = await postService.findPending();
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching pending posts', error: error.message });
        }
    }

    async moderate(req: Request, res: Response) {
        try {
            const idParam = req.params.id;

            if (!idParam) {
                return res.status(400).json({ message: 'Post ID is required' });
            }

            const postId = parseInt(idParam, 10);

            if (isNaN(postId)) {
                return res.status(400).json({ message: 'Invalid post ID format' });
            }

            const { status } = req.body; // Expecting { "status": "approved" | "rejected" }

            // Validate status field
            if (!status || (status !== PostStatus.APPROVED && status !== PostStatus.REJECTED)) {
                return res.status(400).json({
                    message: 'Invalid or missing status field. Must be "approved" or "rejected".'
                });
            }

            const post = await postService.moderate(postId, status);
            res.status(200).json(post);
        } catch (error: any) {
            if (error.message.includes('Post not found')) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: 'Error moderating post', error: error.message });
        }
    }
}