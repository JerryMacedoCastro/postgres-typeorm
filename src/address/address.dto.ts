import { IsString } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

class CreateAddressDto {
  @PrimaryGeneratedColumn()
  public id: string;

  @IsString()
  public street: string;

  @IsString()
  public city: string;

  @IsString()
  public country: string;
}

export default CreateAddressDto;
