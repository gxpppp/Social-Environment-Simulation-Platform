import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder, FindManyOptions } from 'typeorm';

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}

export interface QueryOptions {
  pagination?: PaginationOptions;
  filters?: FilterOptions;
  sort?: SortOptions;
  relations?: string[];
  select?: string[];
}

@Injectable()
export class QueryOptimizationService {
  /**
   * 构建优化的查询
   */
  buildOptimizedQuery<T>(
    repository: Repository<T>,
    options: QueryOptions = {},
  ): SelectQueryBuilder<T> {
    const { filters = {}, sort, relations = [], select } = options;
    
    let queryBuilder = repository.createQueryBuilder('entity');

    // 应用字段选择
    if (select && select.length > 0) {
      queryBuilder.select(select.map(field => `entity.${field}`));
    }

    // 应用关联
    relations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
    });

    // 应用过滤器
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          queryBuilder.andWhere(`entity.${key} IN (:...${key})`, { [key]: value });
        } else if (typeof value === 'string' && value.includes('%')) {
          queryBuilder.andWhere(`entity.${key} LIKE :${key}`, { [key]: value });
        } else {
          queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
        }
      }
    });

    // 应用排序
    if (sort) {
      queryBuilder.orderBy(`entity.${sort.field}`, sort.order);
    }

    return queryBuilder;
  }

  /**
   * 执行分页查询
   */
  async executePaginatedQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    pagination: PaginationOptions = {},
  ): Promise<{ data: T[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const page = Math.max(1, pagination.page || 1);
    const pageSize = Math.min(100, Math.max(1, pagination.pageSize || 10));

    const [data, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 游标分页查询（适用于大数据量）
   */
  async executeCursorQuery<T>(
    repository: Repository<T>,
    cursor?: string,
    limit: number = 20,
    sortField: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ data: T[]; nextCursor: string | null; hasMore: boolean }> {
    const queryBuilder = repository.createQueryBuilder('entity');

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('ascii');
      const [field, value] = decodedCursor.split(':');
      const operator = sortOrder === 'DESC' ? '<' : '>';
      queryBuilder.where(`entity.${field} ${operator} :value`, { value });
    }

    queryBuilder
      .orderBy(`entity.${sortField}`, sortOrder)
      .take(limit + 1);

    const results = await queryBuilder.getMany();
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, -1) : results;

    const nextCursor = hasMore && data.length > 0
      ? Buffer.from(`${sortField}:${data[data.length - 1][sortField]}`).toString('base64')
      : null;

    return { data, nextCursor, hasMore };
  }

  /**
   * 批量操作优化
   */
  async batchOperation<T>(
    repository: Repository<T>,
    ids: string[],
    operation: 'delete' | 'update',
    updateData?: Partial<T>,
  ): Promise<number> {
    const batchSize = 100;
    let affectedCount = 0;

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      
      if (operation === 'delete') {
        const result = await repository.delete(batch);
        affectedCount += result.affected || 0;
      } else if (operation === 'update' && updateData) {
        const result = await repository.update(batch, updateData);
        affectedCount += result.affected || 0;
      }
    }

    return affectedCount;
  }

  /**
   * 缓存键生成
   */
  generateCacheKey(prefix: string, options: QueryOptions): string {
    const keyData = {
      p: options.pagination,
      f: options.filters,
      s: options.sort,
      r: options.relations,
    };
    return `${prefix}:${JSON.stringify(keyData)}`;
  }
}
