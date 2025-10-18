import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { TagEnum } from './entities/tag.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) { }

  async create(createPostDto: CreatePostDto) {
    const title = createPostDto.title;
    const description = createPostDto.description;
    const tags = createPostDto.tags;
    const post = this.postRepo.create({
      title,
      description,
      tags
    });
    await this.postRepo.save(post);
    return {
      id: post.id
    }
  }

  async findAll(page = 1, limit = 9, tags: string[] = []) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 9));

    const qb = this.postRepo
      .createQueryBuilder('post')
      .select(['post.id', 'post.title', 'post.description', 'post.createdAt', 'post.tags'])
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (tags.length) {
      const allowed = new Set(Object.values(TagEnum));
      const invalid = tags.filter(t => !allowed.has(t as TagEnum));
      if (invalid.length) {
        throw new BadRequestException(`Unknown tags: ${invalid.join(', ')}`);
      }

      qb.andWhere('(post.tags)::text[] @> ARRAY[:...tags]::text[]', { tags });
    }

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasPrev: page > 1,
        hasNext: page * limit < total,
      },
    };
  }

  async findOne(postId: number) {
    return this.postRepo.findOne({
      where: { id: postId },
      select: ['id', 'title', 'description', 'tags', 'createdAt', 'updatedAt'],
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) throw new NotFoundException(`Post with id ${id} not found`);

    Object.assign(post, updatePostDto);

    const updatedPost = await this.postRepo.save(post);

    return updatedPost;
  }

  async remove(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    await this.postRepo.remove(post);

    return { message: `Post with id ${id} deleted successfully.` };
  }
}
