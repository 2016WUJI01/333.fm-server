import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

import { Competitions } from './competitions.entity'
import { Scrambles } from './scrambles.entity'

export enum ReconstructionMode {
  MYSELF,
  OTHERS,
}

@Entity()
export class Reconstructions {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 255 })
  @Index()
  solution: string

  @Column({ length: 2048 })
  comment: string

  @Column()
  userId: number

  @Column()
  wcaId: string

  @Column({ default: 0 })
  moves: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column()
  competitionId: number

  @Column()
  scrambleId: number

  @ManyToOne(() => Competitions, competition => competition.reconstructions)
  competition: Competitions

  @ManyToOne(() => Scrambles, scramble => scramble.reconstructions)
  scramble: Scrambles
}
