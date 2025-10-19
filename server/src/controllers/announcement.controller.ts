import { Request, Response } from 'express';
import mongoose from 'mongoose';
// Resolve model from mongoose registry to avoid ESM typing issues
const Announcement: any = mongoose.model('Announcement');

export const listAnnouncements = async (req: Request, res: Response) => {
  try {
    const items = await Announcement.find({})
      .populate('author', 'firstName lastName email')
      .sort({ pinned: -1, createdAt: -1 })
      .limit(200);
    const data = items.map((doc: any) => {
      const obj = doc.toObject();
      const a = obj.author as any;
      const authorName = a?.firstName ? `${a.firstName} ${a.lastName || ''}`.trim() : undefined;
      return { ...obj, authorName };
    });
    res.json({ items: data });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to list announcements', details: e?.message });
  }
};

export const getAnnouncement = async (req: Request, res: Response) => {
  try {
    const item = await Announcement.findById(req.params.id).populate('author', 'firstName lastName email');
    if (!item) return res.status(404).json({ error: 'Not found' });
    const obj: any = item.toObject();
    const a: any = obj.author;
    const authorName = a?.firstName ? `${a.firstName} ${a.lastName || ''}`.trim() : undefined;
    res.json({ ...obj, authorName });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to get announcement', details: e?.message });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, scope = 'school', classId = null, pinned = false, startsAt = null, endsAt = null } = req.body || {};
    if (!title || !content) return res.status(400).json({ error: 'Missing title/content' });
    const author = (req as any).user?.id; // set by auth middleware
    const item = await Announcement.create({ title, content, scope, classId, author, pinned, startsAt, endsAt });
    const populated = await Announcement.findById(item._id).populate('author', 'firstName lastName email');
    const obj: any = populated?.toObject() || item.toObject();
    const a: any = obj.author;
    const authorName = a?.firstName ? `${a.firstName} ${a.lastName || ''}`.trim() : undefined;
    res.status(201).json({ ...obj, authorName });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to create announcement', details: e?.message });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const item = await Announcement.findByIdAndUpdate(id, update, { new: true })
      .populate('author', 'firstName lastName email');
    if (!item) return res.status(404).json({ error: 'Not found' });
    const obj: any = item.toObject();
    const a: any = obj.author;
    const authorName = a?.firstName ? `${a.firstName} ${a.lastName || ''}`.trim() : undefined;
    res.json({ ...obj, authorName });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to update announcement', details: e?.message });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await Announcement.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to delete announcement', details: e?.message });
  }
};
