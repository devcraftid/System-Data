-- Buat bucket penyimpanan bernama 'exports' yang bersifat publik
insert into storage.buckets (id, name, public)
values ('exports', 'exports', true)
on conflict (id) do nothing;

-- Izinkan siapa saja (publik) untuk melihat file (Select)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'exports' );

-- Izinkan user terotentikasi untuk mengunggah file (Insert)
create policy "Auth Insert"
on storage.objects for insert
with check (
  bucket_id = 'exports' and auth.role() = 'authenticated'
);

-- Izinkan user terotentikasi untuk mengupdate file miliknya
create policy "Auth Update"
on storage.objects for update
using (
  bucket_id = 'exports' and auth.role() = 'authenticated'
);

-- Izinkan user terotentikasi untuk menghapus file
create policy "Auth Delete"
on storage.objects for delete
using (
  bucket_id = 'exports' and auth.role() = 'authenticated'
);
