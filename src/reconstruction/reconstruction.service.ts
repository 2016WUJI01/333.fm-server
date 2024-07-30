import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate'
import { Repository } from 'typeorm'

import { SubmitSolutionDto } from '@/dtos/submit-solution.dto'
import { Competitions, CompetitionType } from '@/entities/competitions.entity'
import { Reconstructions } from '@/entities/reconstructions.entity'
import { Scrambles } from '@/entities/scrambles.entity'
import { Submissions } from '@/entities/submissions.entity'
import { Users } from '@/entities/users.entity'
import { calculateMoves } from '@/utils'

@Injectable()
export class ReconstructionService {
  constructor(
    @InjectRepository(Reconstructions)
    private readonly reconstructionsRepository: Repository<Reconstructions>,
    @InjectRepository(Competitions)
    private readonly competitionsRepository: Repository<Competitions>,
    @InjectRepository(Scrambles)
    private readonly scramblesRepository: Repository<Scrambles>,
    @InjectRepository(Submissions)
    private readonly submissionsRepository: Repository<Submissions>,
  ) {}

  async getCompetitions(options: IPaginationOptions): Promise<Pagination<Competitions>> {
    const competitions = await paginate<Competitions>(this.competitionsRepository, options, {
      where: {
        type: CompetitionType.RECONSTRUCTION,
      },
      order: {
        startTime: 'DESC',
      },
    })
    return competitions
  }

  async getCompetition(id: number) {
    const competition = await this.competitionsRepository.findOne({
      where: {
        id,
        type: CompetitionType.RECONSTRUCTION,
      },
      relations: {
        scrambles: true,
      },
    })
    if (!competition) {
      throw new NotFoundException()
    }
    return competition
  }

  async submitSolution(competition: Competitions, user: Users, solution: SubmitSolutionDto) {
    const scramble = await this.scramblesRepository.findOne({
      where: {
        id: solution.scrambleId,
        competitionId: competition.id,
      },
    })
    if (scramble === null) {
      throw new BadRequestException('Invalid scramble')
    }

    const wcaId = user.wcaId
    // if (solution.mode == CompetitionMode.OTHERS) {
    //     wcaId = solution.wcaId
    // }

    const preSubmission = await this.submissionsRepository.findOne({
      where: {
        scrambleId: scramble.id,
        competitionId: competition.id,
        userId: user.id,
        mode: solution.mode,
      },
    })
    const submission = preSubmission || new Submissions()
    submission.competition = competition
    submission.mode = solution.mode
    submission.user = user
    submission.wcaId = wcaId
    submission.scrambleId = scramble.id
    submission.solution = solution.solution
    submission.comment = solution.comment
    submission.moves = calculateMoves(scramble.scramble, submission.solution)

    await this.submissionsRepository.save(submission)

    let reconstruction = await this.reconstructionsRepository.findOne({
      where: {
        scrambleId: scramble.id,
        competitionId: competition.id,
        wcaId,
      },
    })
    if (reconstruction === null) {
      reconstruction = new Reconstructions()
      reconstruction.userId = user.id
      reconstruction.wcaId = wcaId
      reconstruction.competitionId = competition.id
      reconstruction.scrambleId = scramble.id
      reconstruction.solution = solution.solution
      reconstruction.moves = calculateMoves(scramble.scramble, reconstruction.solution)
    } else {
      if (user.wcaId != reconstruction.wcaId) {
        throw new BadRequestException("You can't submit for other users")
      }
    }
    reconstruction.comment = solution.comment
    return this.reconstructionsRepository.save(reconstruction)
  }

  async getSubmissions(competition: Competitions) {
    const submissions = await this.submissionsRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .loadRelationCountAndMap('s.likes', 's.userActivities', 'ual', qb => qb.andWhere('ual.like = 1'))
      .loadRelationCountAndMap('s.favorites', 's.userActivities', 'uaf', qb => qb.andWhere('uaf.favorite = 1'))
      .where('s.competition_id = :id', { id: competition.id })
      .orderBy('s.moves', 'ASC')
      .getMany()
    return submissions
  }
}
