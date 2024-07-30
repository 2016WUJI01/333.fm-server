import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Competitions } from './competitions.entity'
import { EndlessKickoffs } from './endless-kickoffs.entity'
import { Reconstructions } from './reconstructions.entity'

@Entity()
export class Scrambles {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 2, default: null })
  round: string

  @Column({ length: 2, default: null })
  group: string

  @Column()
  number: number

  @Column({ length: 255 })
  @Index()
  scramble: string

  @Column()
  competitionId: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Competitions, competition => competition.scrambles, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  competition: Competitions

  @OneToMany(() => Reconstructions, reconstruction => reconstruction.competition)
  reconstructions: Reconstructions[]

  @OneToMany(() => EndlessKickoffs, kickoff => kickoff.scramble)
  kickoffs: EndlessKickoffs[]

  cubieCube: {
    corners: number[]
    edges: number[]
    placement: number
  }

  removeScramble() {
    this.scramble = ''
  }
}
