"use client";

import { useActionState, useState } from "react";
import type { Page } from "@prisma/client";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { savePageAction, type PageActionState } from "@/app/(admin)/admin/(dashboard)/pages/actions";

const input = "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm";
const label = "mb-1 block text-xs font-medium text-ink-600";

export function PageEditor({ page }: { page: Page }) {
  const [state, formAction, pending] = useActionState<PageActionState, FormData>(
    savePageAction.bind(null, page.id),
    {}
  );
  const [content, setContent] = useState(page.content);
  const [contentEn, setContentEn] = useState(page.contentEn ?? "");

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="contentEn" value={contentEn} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Titre (FR)</label>
          <input name="title" defaultValue={page.title} required className={input} />
        </div>
        <div>
          <label className={label}>Titre (EN)</label>
          <input name="titleEn" defaultValue={page.titleEn ?? ""} className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Contenu (FR)</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>
      <div>
        <label className={label}>Contenu (EN)</label>
        <RichTextEditor value={contentEn} onChange={setContentEn} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Statut</label>
          <select name="status" defaultValue={page.status} className={input}>
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
          </select>
        </div>
        <div>
          <label className={label}>Titre SEO</label>
          <input name="seoTitle" defaultValue={page.seoTitle ?? ""} className={input} />
        </div>
      </div>
      <div>
        <label className={label}>Description SEO</label>
        <input name="seoDescription" defaultValue={page.seoDescription ?? ""} className={input} />
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-cta">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
