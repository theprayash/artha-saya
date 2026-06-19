'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Link2, Image as ImageIcon,
  Youtube as YoutubeIcon, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Minus, Undo, Redo, Heading1, Heading2, Heading3, Code,
} from 'lucide-react'
import { useCallback, useState } from 'react'

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-accent text-black'
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'
      }`}
    >
      {children}
    </button>
  )
}

export default function TiptapEditor({ content, onChange, placeholder = 'Write your article...' }: Props) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [showYoutubeInput, setShowYoutubeInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-accent underline' } }),
      Image.configure({ inline: false, HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
      Youtube.configure({ width: 840, height: 472, nocookie: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'focus:outline-none min-h-[400px]' },
    },
  })

  const addLink = useCallback(() => {
    if (!linkUrl) return
    editor?.chain().focus().setLink({ href: linkUrl }).run()
    setLinkUrl('')
    setShowLinkInput(false)
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL:')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const addYoutube = useCallback(() => {
    if (!youtubeUrl) return
    editor?.commands.setYoutubeVideo({ src: youtubeUrl })
    setYoutubeUrl('')
    setShowYoutubeInput(false)
  }, [editor, youtubeUrl])

  if (!editor) return null

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-[var(--border)] bg-[var(--surface2)]">
        {/* History */}
        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={15} />
        </ToolBtn>
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {/* Headings */}
        <ToolBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={15} />
        </ToolBtn>
        <ToolBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={15} />
        </ToolBtn>
        <ToolBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {/* Marks */}
        <ToolBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} />
        </ToolBtn>
        <ToolBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </ToolBtn>
        <ToolBtn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={15} />
        </ToolBtn>
        <ToolBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={15} />
        </ToolBtn>
        <ToolBtn title="Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {/* Align */}
        <ToolBtn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft size={15} />
        </ToolBtn>
        <ToolBtn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter size={15} />
        </ToolBtn>
        <ToolBtn title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {/* Lists */}
        <ToolBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} />
        </ToolBtn>
        <ToolBtn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </ToolBtn>
        <ToolBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={15} />
        </ToolBtn>
        <ToolBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {/* Link */}
        <ToolBtn title="Insert link" active={editor.isActive('link')} onClick={() => setShowLinkInput(v => !v)}>
          <Link2 size={15} />
        </ToolBtn>

        {/* Image */}
        <ToolBtn title="Insert image" onClick={addImage}>
          <ImageIcon size={15} />
        </ToolBtn>

        {/* YouTube */}
        <ToolBtn title="Embed YouTube video" onClick={() => setShowYoutubeInput(v => !v)}>
          <YoutubeIcon size={15} />
        </ToolBtn>
      </div>

      {/* Link input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--surface)]">
          <Link2 size={14} className="text-[var(--text-muted)] shrink-0" />
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={e => e.key === 'Enter' && addLink()}
            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none"
            autoFocus
          />
          <button onClick={addLink} className="text-xs text-accent px-2 py-0.5 rounded border border-accent/30 hover:bg-accent/10">
            Add
          </button>
          <button onClick={() => setShowLinkInput(false)} className="text-xs text-[var(--text-muted)]">
            Cancel
          </button>
        </div>
      )}

      {/* YouTube input */}
      {showYoutubeInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--surface)]">
          <YoutubeIcon size={14} className="text-red-500 shrink-0" />
          <input
            type="url"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            onKeyDown={e => e.key === 'Enter' && addYoutube()}
            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none"
            autoFocus
          />
          <button onClick={addYoutube} className="text-xs text-accent px-2 py-0.5 rounded border border-accent/30 hover:bg-accent/10">
            Embed
          </button>
          <button onClick={() => setShowYoutubeInput(false)} className="text-xs text-[var(--text-muted)]">
            Cancel
          </button>
        </div>
      )}

      {/* Editor body */}
      <div className="p-4 prose-blog">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
