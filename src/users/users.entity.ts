import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  Name: string;

  @Column()
  Email: string;

  @Column()
  Age: string;

  @Column({ nullable: true })
  School: string;
}
