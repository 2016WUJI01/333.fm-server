import { CacheInterceptor } from '@nestjs/cache-manager'
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'

import { CurrentUser } from '@/auth/decorators/current-user.decorator'
import { JwtRequiredGuard } from '@/auth/guards/jwt-required.guard'
import { PaginationDto } from '@/dtos/pagination.dto'
import { SubmitSolutionDto } from '@/dtos/submit-solution.dto'
import { Submissions } from '@/entities/submissions.entity'
import { Users } from '@/entities/users.entity'
import { UserService } from '@/user/user.service'

import { ReconstructionService } from './reconstruction.service'

@Controller('reconstruction')
export class ReconstructionController {
  constructor(
    private reconstructionService: ReconstructionService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  public async getCompetitions(@Query() { page, limit }: PaginationDto) {
    return this.reconstructionService.getCompetitions({ page, limit })
  }

  @Get(':competitionId')
  @UseInterceptors(CacheInterceptor)
  public async getCompetition(@Param('competitionId') competitionId: number) {
    return this.reconstructionService.getCompetition(competitionId)
  }

  @Post(':competitionId')
  @UseGuards(JwtRequiredGuard)
  public async submit(
    @Param('competitionId') competitionId: number,
    @CurrentUser() user: Users,
    @Body() solution: SubmitSolutionDto,
  ) {
    const competition = await this.reconstructionService.getCompetition(competitionId)
    if (!competition) {
      throw new NotFoundException()
    }
    return this.reconstructionService.submitSolution(competition, user, solution)
  }

  @Get(':competitionId/submissions')
  @UseGuards(JwtRequiredGuard)
  public async getSubmissions(@CurrentUser() user: Users, @Param('competitionId') competitionId: number) {
    const competition = await this.reconstructionService.getCompetition(competitionId)
    if (!competition) {
      throw new NotFoundException()
    }
    const submissions = await this.reconstructionService.getSubmissions(competition)
    const ret: Record<number, Submissions[]> = {}
    const userSubmissions = submissions.filter(submission => submission.user.id === user.id)
    submissions.forEach(submission => {
      if (!ret[submission.scrambleId]) {
        ret[submission.scrambleId] = []
      }
      ret[submission.scrambleId].push(submission)
      if (user) {
        if (submission.userId === user.id) {
          userSubmissions[submission.scrambleId] = submission
        }
      }
    })
    submissions.forEach(submission => {
      if (userSubmissions[submission.scrambleId] || competition.hasEnded) {
        submission.hideSolution = false
      } else {
        submission.hideSolution = true
        submission.removeSolution()
      }
    })
    if (user) {
      await this.userService.loadUserActivities(user, submissions)
    }
    return ret
  }
}
