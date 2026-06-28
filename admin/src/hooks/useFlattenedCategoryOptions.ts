// src/hooks/useFlattenedCategoryOptions.ts

import { useGetCategoryTreeQuery } from '../features/inventory/category/categoryApi';

interface CategoryOption {
  label: string;
  value: string;
  depth: number;
}

// ✅ Tree → flat array with depth info (for indented select options)
const flattenTree = (nodes: any[], depth = 0): CategoryOption[] => {
  return nodes.reduce((acc: CategoryOption[], node) => {
    const prefix = depth === 0 ? '' : '　'.repeat(depth) + '└ ';
    acc.push({
      label: `${prefix}${node.name}`,
      value: node.id,
      depth,
    });
    if (node.children?.length > 0) {
      acc.push(...flattenTree(node.children, depth + 1));
    }
    return acc;
  }, []);
};

export const useFlattenedCategoryOptions = (excludeId?: string) => {
  const { data, isLoading } = useGetCategoryTreeQuery({});

  const tree: any[] = data?.data || [];

  const filterSelf = (nodes: any[], excludeId: string): any[] => {
    return nodes
      .filter((n) => n.id !== excludeId)
      .map((n) => ({
        ...n,
        children: filterSelf(n.children || [], excludeId),
      }));
  };

  const filteredTree = excludeId ? filterSelf(tree, excludeId) : tree;
  const options = flattenTree(filteredTree);

  return { options, isLoading };
};
