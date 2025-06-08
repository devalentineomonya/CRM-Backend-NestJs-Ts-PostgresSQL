import { PrimaryGeneratedColumn, Column, Entity, Unique } from 'typeorm';

@Entity({ name: 'dashboard_metrics' })
@Unique(['metric_name'])
export class AdminMetric {
  @PrimaryGeneratedColumn('uuid')
  metric_id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  metric_name: string;

  @Column({ type: 'int', nullable: false })
  metric_value: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_updated: Date;
}
