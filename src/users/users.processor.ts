import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UserDto } from './dto/user.dto';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Processor('import_user')
export class UsersProcessor {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Process('process_csv')
  async handleCsvProcessing(job: Job) {
    const { csvContent } = job.data;

    if (!csvContent) {
      console.error(' No CSV content received');
      throw new Error('CSV content is missing in the job data.');
    }

    console.log(
      '📄 Raw CSV Content (first 500 chars):',
      csvContent.slice(0, 500),
    );

    try {
      const users: User[] = [];
      const invalidRows: { row: any; errors: any[] }[] = [];
      const stream = Readable.from(csvContent);

      const processingPromises: Promise<void>[] = [];

      await new Promise<void>((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (row) => {
            processingPromises.push(
              (async () => {

                const userInstance = plainToInstance(UserDto, row);
                const errors = await validate(userInstance);

                if (errors.length > 0) {
                  console.error(' Validation Errors:', errors);
                  invalidRows.push({ row, errors });
                } else {
                  const newUser = this.userRepository.create({
                    Name: row.Name,
                    Email: row.Email,
                    Age: row.Age,
                    School: row.School || null,
                  });
                  users.push(newUser);
                }
              })(),
            );
          })
          .on('end', async () => {
            await Promise.all(processingPromises);

            if (users.length > 0) {
              await this.userRepository.save(users);
            }

            resolve();
          })
          .on('error', (error) => {
            console.error(' CSV Parsing Error:', error);
            reject(error);
          });
      });

      return { valid: users.length, invalid: invalidRows.length };
    } catch (error) {
      console.error(' Error processing CSV:', error);
      throw new Error(`CSV processing error: ${error.message}`);
    }
  }
}
