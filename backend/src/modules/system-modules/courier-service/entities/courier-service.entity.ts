
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('courier_services')
export class CourierService {
  @PrimaryColumn({ type: 'int' })
  id: number;
  @Column({ type: 'varchar', length: 100 })
  name: string;
}
