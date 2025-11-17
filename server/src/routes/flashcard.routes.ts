import express from 'express';
import { FlashcardService } from '../services/flashcardService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { Types } from 'mongoose';

const router = express.Router();
const flashcardService = new FlashcardService();

// Submit flashcard attempt
router.post('/flashcards/:flashcardSetId/submit', authMiddleware, async (req, res) => {
    try {
        const { flashcardSetId } = req.params;
        const userId = req.user.id;
        const { cards, timeSpentMinutes, startedAt, sessionId } = req.body;

        console.log('=== Submit Flashcard Attempt ===');
        console.log('flashcardSetId:', flashcardSetId);
        console.log('userId:', userId);
        console.log('cards length:', cards?.length);
        console.log('timeSpentMinutes:', timeSpentMinutes);
        console.log('startedAt:', startedAt);
        console.log('sessionId:', sessionId);

        // Validate required fields
        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cards array is required'
            });
        }

        if (timeSpentMinutes === undefined || timeSpentMinutes === null || timeSpentMinutes < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid timeSpentMinutes is required'
            });
        }

        if (!startedAt || !sessionId) {
            return res.status(400).json({
                success: false,
                message: 'startedAt and sessionId are required'
            });
        }

        // Get flashcard set to get classId
        const { FlashcardSet } = await import('../models/FlashcardSet.js');
        const flashcardSet = await FlashcardSet.findById(flashcardSetId);
        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard set not found'
            });
        }

        const attempt = await flashcardService.saveAttempt({
            userId,
            flashcardSetId,
            classId: flashcardSet.classId.toString(),
            cards,
            timeSpentMinutes,
            startedAt,
            sessionId
        });

        console.log('Flashcard attempt saved successfully:', attempt._id);

        res.status(201).json({
            success: true,
            message: 'Flashcard attempt saved successfully',
            data: {
                attempt: {
                    _id: attempt._id,
                    score: attempt.score,
                    correctCards: attempt.correctCards,
                    incorrectCards: attempt.incorrectCards,
                    totalCards: attempt.totalCards,
                    timeSpentMinutes: attempt.timeSpentMinutes,
                    completedAt: attempt.completedAt,
                    cards: attempt.cards
                }
            }
        });
    } catch (error: any) {
        console.error('Error saving flashcard attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get latest attempt for user
router.get('/flashcards/:flashcardSetId/latest', authMiddleware, async (req, res) => {
    try {
        const { flashcardSetId } = req.params;
        const userId = req.user.id;

        const attempt = await flashcardService.getLatestAttempt(userId, flashcardSetId);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'No attempts found for this flashcard set'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Latest attempt retrieved successfully',
            data: {
                attempt: {
                    _id: attempt._id,
                    score: attempt.score,
                    correctCards: attempt.correctCards,
                    incorrectCards: attempt.incorrectCards,
                    totalCards: attempt.totalCards,
                    timeSpentMinutes: attempt.timeSpentMinutes,
                    completedAt: attempt.completedAt,
                    startedAt: attempt.startedAt,
                    cards: attempt.cards,
                    flashcardSet: attempt.flashcardSetId
                }
            }
        });
    } catch (error: any) {
        console.error('Error getting latest attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get attempt by ID
router.get('/flashcard-attempts/:attemptId', authMiddleware, async (req, res) => {
    try {
        const { attemptId } = req.params;

        const attempt = await flashcardService.getAttemptById(attemptId);

        console.log('=== Get Attempt By ID ===');
        console.log('attemptId:', attemptId);
        console.log('attempt:', attempt);
        console.log('attempt.flashcardSetId:', attempt?.flashcardSetId);
        console.log('typeof flashcardSetId:', typeof attempt?.flashcardSetId);

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Attempt not found'
            });
        }

        // Check if user owns this attempt
        if (attempt.userId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Attempt retrieved successfully',
            data: {
                attempt: {
                    _id: attempt._id,
                    score: attempt.score,
                    correctCards: attempt.correctCards,
                    incorrectCards: attempt.incorrectCards,
                    totalCards: attempt.totalCards,
                    timeSpentMinutes: attempt.timeSpentMinutes,
                    completedAt: attempt.completedAt,
                    startedAt: attempt.startedAt,
                    cards: attempt.cards,
                    flashcardSet: attempt.flashcardSetId,
                    user: attempt.userId
                }
            }
        });
    } catch (error: any) {
        console.error('Error getting attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get all attempts for user and flashcard set
router.get('/flashcards/:flashcardSetId/attempts', authMiddleware, async (req, res) => {
    try {
        const { flashcardSetId } = req.params;
        const userId = req.user.id;
        const limit = parseInt(req.query.limit as string) || 10;

        const attempts = await flashcardService.getUserAttempts(userId, flashcardSetId, limit);

        res.status(200).json({
            success: true,
            message: 'Attempts retrieved successfully',
            data: {
                attempts: attempts.map(attempt => ({
                    _id: attempt._id,
                    score: attempt.score,
                    correctCards: attempt.correctCards,
                    incorrectCards: attempt.incorrectCards,
                    totalCards: attempt.totalCards,
                    timeSpentMinutes: attempt.timeSpentMinutes,
                    completedAt: attempt.completedAt,
                    startedAt: attempt.startedAt,
                    flashcardSet: attempt.flashcardSetId
                }))
            }
        });
    } catch (error: any) {
        console.error('Error getting attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export default router;
