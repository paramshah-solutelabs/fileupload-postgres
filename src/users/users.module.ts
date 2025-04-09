import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BullModule } from '@nestjs/bull';
import { UsersProcessor } from './users.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'import_user' }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService, UsersProcessor],
  controllers: [UsersController],
})
export class UsersModule {}
