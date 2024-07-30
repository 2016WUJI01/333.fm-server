import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Competitions } from '@/entities/competitions.entity'
import { Reconstructions } from '@/entities/reconstructions.entity'
import { Scrambles } from '@/entities/scrambles.entity'
import { Submissions } from '@/entities/submissions.entity'
import { Users } from '@/entities/users.entity'
import { UserModule } from '@/user/user.module'

import { ReconstructionController } from './reconstruction.controller'
import { ReconstructionService } from './reconstruction.service'

@Module({
  imports: [TypeOrmModule.forFeature([Reconstructions, Competitions, Scrambles, Submissions, Users]), UserModule],
  providers: [ReconstructionService],
  controllers: [ReconstructionController],
})
export class ReconstructionModule {}
