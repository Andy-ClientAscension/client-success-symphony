
import { faker } from '@faker-js/faker';

export interface MockClient {
  id: string;
  clientId: string;
  clientName: string;
  status: "renewed" | "churned";
  renewalDate: string;
  notes: string;
  painPoints: string[];
  team?: string;
}

export const generateMockClients = (count: number = 10000): MockClient[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: faker.string.uuid(),
    clientId: faker.string.uuid(),
    clientName: faker.company.name(),
    status: faker.helpers.arrayElement(["renewed", "churned"]),
    renewalDate: faker.date.future().toISOString(),
    notes: faker.lorem.sentence(),
    painPoints: Array.from(
      { length: faker.number.int({ min: 0, max: 3 }) },
      () => faker.lorem.words(3)
    ),
    team: faker.helpers.arrayElement([
      "Enterprise",
      "SMB",
      "Startup",
      undefined
    ])
  }));
};

export const mockClients = generateMockClients();
