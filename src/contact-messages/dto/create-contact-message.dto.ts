import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Jane Doe' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @Transform(trim)
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Is Beng Mealea open on Sundays?' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;
}
