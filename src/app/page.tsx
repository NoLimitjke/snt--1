'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const TAGS = ['ВСЕ', 'ВАЖНОЕ', 'СОВЕЩАНИЕ', 'МЕРОПРИЯТИЯ'];

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'ВСЕ');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');

  const fetchPosts = async (pageNum: number, tag?: string, search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(tag && tag !== 'ВСЕ' && { tag }),
        ...(search && { search }),
      });

      const res = await fetch(`/api/posts?${params}`);

      if (!res.ok) {
        console.error('API error:', res.status, res.statusText);
        setPosts([]);
        return;
      }

      const data = await res.json();

      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tag = searchParams.get('tag') || 'ВСЕ';
    const search = searchParams.get('search') || '';
    setSelectedTag(tag);
    setSearchQuery(search);
    setDebouncedSearch(search);
    fetchPosts(1, tag !== 'ВСЕ' ? tag : undefined, search || undefined);
  }, [searchParams]);

  // Debounced search - обновляем URL каждые 300мс после последнего ввода
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      } else {
        params.delete('search');
      }
      params.delete('page');
      router.push(`/?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    if (tag === 'ВСЕ') {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setDebouncedSearch(value);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">СНТ №1 - Новости и объявления</h1>
        <p className="text-muted-foreground">
          Добро пожаловать на официальный сайт нашего садового товарищества
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleTagClick(tag)}>
              {tag}
            </Badge>
          ))}
        </div>

        <form className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск по заголовкам..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
          <Button type="button" variant="green" onClick={() => setDebouncedSearch(searchQuery)}>
            Найти
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Посты не найдены</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.$id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}>
            Назад
          </Button>
          <span className="flex items-center px-4">
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}>
            Вперед
          </Button>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={<div className="flex h-screen items-center justify-center">Загрузка...</div>}>
      <HomeContent />
    </Suspense>
  );
}
