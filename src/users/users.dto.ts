import { IsString } from 'class-validator';
import { OneToMany } from 'typeorm';
import Post from '../posts/posts.interface';

class CreateUserDto {
  @IsString()
  public name: string;

  @IsString()
  public email: string;

  @IsString()
  public password: string;
}

export default CreateUserDto;
