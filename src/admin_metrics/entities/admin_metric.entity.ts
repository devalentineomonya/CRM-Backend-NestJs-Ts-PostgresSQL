import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'dashboard_metrics' })
export class AdminMetric {
  @PrimaryGeneratedColumn()
  metric_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  metric_name: string;

  @Column({ type: 'int', nullable: false })
  metric_value: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_updated: Date;
}
