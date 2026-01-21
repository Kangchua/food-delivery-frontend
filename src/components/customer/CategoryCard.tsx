import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/api/dataApi';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, className }) => {
  return (
    <Link
      to={`/menu?category=${category.id}`}
      className={cn(
        'group flex flex-col items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-xl">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {category.productCount} món
        </p>
      </div>
    </Link>
  );
};

export default CategoryCard;
