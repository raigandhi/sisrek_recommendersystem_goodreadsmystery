import { HeroBanner } from "../components/HeroBanner";
import { BookCard } from "../components/BookCard";
import { Book } from "../data/books";

interface ListPageProps {
  title: string;
  emptyMessage: string;
  books: Book[];
  onBookClick: (book: Book) => void;
}

export function ListPage({ title, emptyMessage, books, onBookClick }: ListPageProps) {
  return (
    <div className="space-y-6">
      <HeroBanner title={title} />

      {books.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.book_id}
              book={book}
              onClick={() => onBookClick(book)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
