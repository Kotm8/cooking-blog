import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { TagEnum } from '../entities/tag.enum';

export class CreatePostDto {
    @IsString()
    @Length(1, 255, { message: 'Title must be between 1 and 255 characters.' })
    title: string;

    @Transform(({ value }) =>
        typeof value === 'string' ? (value.trim() === '' ? undefined : value.trim()) : value
    )
    @IsString()
    @IsOptional()
    description: string;

    @IsOptional()
    @IsEnum(TagEnum, { each: true })
    tags?: TagEnum[];
}
