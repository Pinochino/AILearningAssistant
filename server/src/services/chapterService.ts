// import { Class } from '../models/class.model'
// import { Chapter, type IChapter } from '../models/Chapter'

// export class ChapterService {
//   // Tạo chapter mới
//   async create(data: {
//     title: string,
//     classId: string,
//     createdBy: string  // userId
//   }) {
//     // Kiểm tra class tồn tại
//     const cls = await Class.findById(data.classId);
//     if (!cls) throw new Error('Class not found');

//     // Kiểm tra user có phải teacher của class
//     if (cls.teacherId.toString() !== data.createdBy) {
//       throw new Error('Not authorized');
//     }

//     // Tự động tính order
//     const lastChapter = await Chapter.findOne({ classId: data.classId })
//       .sort({ order: -1 });
//     const order = (lastChapter?.order || 0) + 1;

//     // Tạo chapter
//     return Chapter.create({
//       ...data,
//       order,
//     });
//   }

//   // Lấy chapters của một class
//   async getByClassId(classId: string) {
//     return Chapter.find({ classId })
//       .sort({ order: 1 })
//       .populate('documents')
//       .populate('quizzes')
//       .populate('flashcards');
//   }

//   // Cập nhật chapter
//   async update(id: string, data: Partial<IChapter>, userId: string) {
//     const chapter = await Chapter.findById(id);
//     if (!chapter) throw new Error('Chapter not found');

//     // Kiểm tra quyền
//     const cls = await Class.findById(chapter.classId);
//     if (cls?.teacherId.toString() !== userId) {
//       throw new Error('Not authorized');
//     }

//     return Chapter.findByIdAndUpdate(id, data, { new: true });
//   }

//   // Xóa chapter (soft delete)
//   async remove(id: string, userId: string) {
//     const chapter = await Chapter.findById(id);
//     if (!chapter) throw new Error('Chapter not found');

//     // Kiểm tra quyền
//     const cls = await Class.findById(chapter.classId);
//     if (cls?.teacherId.toString() !== userId) {
//       throw new Error('Not authorized');
//     }

//     // Soft delete
//     await chapter.delete();

//     // Có thể thêm logic để handle related data
//     // Ví dụ: đánh dấu documents, quizzes, flashcards là deleted
//   }
// }