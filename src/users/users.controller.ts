import { Controller, Post, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios from 'axios';

@Controller('users')
export class UsersController {
  constructor(@InjectQueue('import_user') private userQueue: Queue) {}

  @Post('import')
  async processFileFromUrl(@Body('fileUrl') fileUrl: string) {
    if (!fileUrl) {
      return { message: 'File URL is required' };
    }

    try {
      const response = await axios.get(fileUrl, { responseType: 'text' });

      await this.userQueue.add(
        'process_csv',
        { csvContent: response.data },
        { removeOnComplete: true },
      );

      return { message: 'CSV processing started' };
    } catch (error) {
      console.error('❌ Error fetching CSV:', error);
      return { message: 'Error fetching CSV', error: error.message };
    }
  }
}
