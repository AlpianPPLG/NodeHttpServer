/**
 * Posts routes
 */

import { Router } from 'express';
import { postsController } from '../../controllers/posts.controller';
import { authenticateToken, optionalAuth, requireModerator } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { CreatePostSchema, UpdatePostSchema, CreateCommentSchema } from '../../schemas/post.schema';

const router = Router();

/**
 * @swagger
 * /posts/trending:
 *   get:
 *     tags: [Posts]
 *     summary: Get trending posts (sorted by likes)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Trending posts list
 */
router.get('/trending', postsController.getTrendingPosts.bind(postsController));

/**
 * @swagger
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get all posts (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, likes, viewCount, title]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Posts list with pagination
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', optionalAuth, postsController.getAllPosts.bind(postsController));
router.post('/', authenticateToken, validateRequest(CreatePostSchema), postsController.createPost.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Posts]
 *     summary: Update a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostRequest'
 *     responses:
 *       200:
 *         description: Post updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', optionalAuth, postsController.getPostById.bind(postsController));
router.put('/:id', authenticateToken, validateRequest(UpdatePostSchema), postsController.updatePost.bind(postsController));
router.delete('/:id', authenticateToken, postsController.deletePost.bind(postsController));

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     tags: [Posts]
 *     summary: Like a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked
 *   delete:
 *     tags: [Posts]
 *     summary: Unlike a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post unliked
 */
router.post('/:id/like', authenticateToken, postsController.likePost.bind(postsController));
router.delete('/:id/like', authenticateToken, postsController.unlikePost.bind(postsController));

/**
 * @swagger
 * /posts/{id}/comments:
 *   get:
 *     tags: [Posts]
 *     summary: Get comments for a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Comments list
 *   post:
 *     tags: [Posts]
 *     summary: Add a comment to a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentRequest'
 *     responses:
 *       201:
 *         description: Comment submitted (pending approval)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/comments', postsController.getPostComments.bind(postsController));
router.post('/:id/comments', authenticateToken, validateRequest(CreateCommentSchema), postsController.createComment.bind(postsController));

export { router as postsRoutes };
