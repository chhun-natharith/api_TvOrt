import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

/** URL-safe identifier: lowercase words joined by single hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const IsSlug = () =>
  applyDecorators(
    ApiProperty({ example: 'siem-reap' }),
    IsString(),
    MaxLength(100),
    Matches(SLUG_PATTERN, {
      message: 'must be lowercase letters, numbers and single hyphens',
    }),
  );
