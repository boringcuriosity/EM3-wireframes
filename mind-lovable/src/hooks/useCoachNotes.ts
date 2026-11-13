import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NoteAttachment {
  id: string;
  note_id: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface CoachNote {
  id: string;
  mobile: string;
  note_text: string;
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
  updated_at: string;
  attachments: NoteAttachment[];
}

export function useCoachNotes(mobile: string) {
  return useQuery({
    queryKey: ['coach-notes', mobile],
    queryFn: async () => {
      if (!mobile) return [];
      const { data, error } = await supabase
        .from('coach_notes')
        .select('*')
        .eq('mobile', mobile)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch attachments for all notes
      const noteIds = (data || []).map(n => n.id);
      let attachments: NoteAttachment[] = [];
      if (noteIds.length > 0) {
        const { data: attData, error: attError } = await supabase
          .from('note_attachments')
          .select('*')
          .in('note_id', noteIds)
          .order('created_at', { ascending: true });
        if (!attError && attData) attachments = attData as NoteAttachment[];
      }

      const attMap = new Map<string, NoteAttachment[]>();
      attachments.forEach(a => {
        if (!attMap.has(a.note_id)) attMap.set(a.note_id, []);
        attMap.get(a.note_id)!.push(a);
      });

      return (data || []).map(note => ({
        ...note,
        attachments: attMap.get(note.id) || [],
      })) as CoachNote[];
    },
    enabled: !!mobile,
  });
}

async function uploadFile(mobile: string, file: File) {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${mobile}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('coach-attachments')
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('coach-attachments')
    .getPublicUrl(path);

  let fileType = 'file';
  if (file.type.startsWith('image/')) fileType = 'image';
  else if (file.type.startsWith('video/')) fileType = 'video';

  return { url: urlData.publicUrl, type: fileType };
}

export function useSaveCoachNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mobile,
      noteText,
      attachmentFiles,
      noteId,
    }: {
      mobile: string;
      noteText: string;
      attachmentFiles?: File[];
      noteId?: string;
    }) => {
      let createdNoteId = noteId;

      if (noteId) {
        const { error } = await supabase
          .from('coach_notes')
          .update({ note_text: noteText, updated_at: new Date().toISOString() })
          .eq('id', noteId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('coach_notes')
          .insert([{ mobile, note_text: noteText }])
          .select('id')
          .single();
        if (error) throw error;
        createdNoteId = data.id;
      }

      // Upload and link attachments
      if (attachmentFiles && attachmentFiles.length > 0 && createdNoteId) {
        for (const file of attachmentFiles) {
          const uploaded = await uploadFile(mobile, file);
          const { error: attError } = await supabase
            .from('note_attachments')
            .insert([{ note_id: createdNoteId, file_url: uploaded.url, file_type: uploaded.type }]);
          if (attError) throw attError;
        }
      }
    },
    onSuccess: (_, { mobile }) => {
      queryClient.invalidateQueries({ queryKey: ['coach-notes', mobile] });
    },
  });
}

export function useDeleteCoachNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, mobile }: { noteId: string; mobile: string }) => {
      const { error } = await supabase
        .from('coach_notes')
        .delete()
        .eq('id', noteId);
      if (error) throw error;
      return mobile;
    },
    onSuccess: (mobile) => {
      queryClient.invalidateQueries({ queryKey: ['coach-notes', mobile] });
    },
  });
}
