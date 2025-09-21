import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Plus, X } from 'lucide-react'

interface FlashcardItem {
  id: string
  front: string
  back: string
}

interface Flashcard {
  id: string
  title: string
  description: string
  subject: string
  chapterIds: string[]
  chapterNames: string[]
  cards: FlashcardItem[]
  difficulty: string
  isPublic: boolean
}

interface EditFlashcardDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  flashcard: Flashcard | null
  onSave: (flashcard: Flashcard) => void
}

const mockChapters = [
  {
    id: '1',
    title: 'Chương 1: Hàm số và đồ thị'
  },
  {
    id: '2',
    title: 'Chương 2: Đạo hàm'
  },
  {
    id: '3',
    title: 'Chương 3: Ứng dụng đạo hàm'
  }
]

// Mock data cho flashcard items
const mockCards: FlashcardItem[] = [
  {
    id: '1',
    front: 'Định nghĩa đạo hàm',
    back: 'Đạo hàm của hàm số f(x) tại điểm x₀ là giới hạn của tỷ số [f(x₀+h) - f(x₀)]/h khi h tiến về 0'
  },
  {
    id: '2',
    front: 'Công thức đạo hàm của x^n',
    back: "(x^n)' = n.x^(n-1)"
  }
]

export function EditFlashcardDialog({ isOpen, onOpenChange, flashcard, onSave }: EditFlashcardDialogProps) {
  const [title, setTitle] = useState(flashcard?.title || '')
  const [description, setDescription] = useState(flashcard?.description || '')
  const [selectedChapters, setSelectedChapters] = useState<string[]>(flashcard?.chapterIds || [])
  const [cards, setCards] = useState<FlashcardItem[]>(flashcard?.cards?.length ? flashcard.cards : mockCards)
  const [visibility, setVisibility] = useState<'private' | 'public'>(flashcard?.isPublic ? 'public' : 'private')

  const handleChapterSelect = (chapterId: string, checked: boolean) => {
    if (checked) {
      setSelectedChapters([...selectedChapters, chapterId])
    } else {
      setSelectedChapters(selectedChapters.filter((id) => id !== chapterId))
    }
  }

  const addCard = () => {
    const newCard: FlashcardItem = {
      id: Date.now().toString(),
      front: '',
      back: ''
    }
    setCards([...cards, newCard])
  }

  const removeCard = (cardId: string) => {
    if (cards.length > 1) {
      setCards(cards.filter((c) => c.id !== cardId))
    }
  }

  const updateCard = (cardId: string, field: keyof FlashcardItem, value: string) => {
    setCards(cards.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)))
  }

  const handleSave = () => {
    if (!flashcard) return

    const updatedFlashcard: Flashcard = {
      ...flashcard,
      title,
      description,
      chapterIds: selectedChapters,
      chapterNames: selectedChapters.map((id) => {
        const chapter = mockChapters.find((c) => c.id === id)
        return chapter?.title || ''
      }),
      cards,
      isPublic: visibility === 'public'
    }

    onSave(updatedFlashcard)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Flashcard</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='space-y-2'>
            <Label>Tiêu đề flashcard</Label>
            <Input placeholder='Nhập tiêu đề flashcard' value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className='space-y-2'>
            <Label>Mô tả</Label>
            <Textarea
              placeholder='Nhập mô tả flashcard'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className='space-y-2'>
            <Label>Chọn chương học</Label>
            <div className='grid grid-cols-1 gap-2 border rounded p-3'>
              {mockChapters.map((chapter) => (
                <div key={chapter.id} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`edit-fc-chapter-${chapter.id}`}
                    checked={selectedChapters.includes(chapter.id)}
                    onCheckedChange={(checked) => handleChapterSelect(chapter.id, checked as boolean)}
                  />
                  <Label htmlFor={`edit-fc-chapter-${chapter.id}`}>{chapter.title}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label>Thẻ flashcard</Label>
              <Button type='button' variant='outline' size='sm' onClick={addCard}>
                <Plus className='h-4 w-4 mr-1' />
                Thêm thẻ
              </Button>
            </div>

            <div className='space-y-6'>
              {cards.map((card, cardIndex) => (
                <Card key={card.id}>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base'>Thẻ {cardIndex + 1}</CardTitle>
                      {cards.length > 1 && (
                        <Button type='button' variant='ghost' size='sm' onClick={() => removeCard(card.id)}>
                          <X className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label>Mặt trước</Label>
                        <Textarea
                          placeholder='Nhập nội dung mặt trước...'
                          value={card.front}
                          onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Mặt sau</Label>
                        <Textarea
                          placeholder='Nhập nội dung mặt sau...'
                          value={card.back}
                          onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='space-y-4'>
              <Label>Chế độ hiển thị</Label>
              <RadioGroup value={visibility} onValueChange={setVisibility} className='flex flex-row gap-6'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='private' id='edit-fc-private' />
                  <Label htmlFor='edit-fc-private'>Chỉ mình tôi</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='public' id='edit-fc-public' />
                  <Label htmlFor='edit-fc-public'>Công khai</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu thay đổi</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
