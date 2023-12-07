import { PrismaClient, Currency, Plan, PlanType, Role, Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker';

export const plans: Array<Omit<Plan, 'id'>> = [
  {
    type: PlanType.FREE,
    price: 0,
    tokens: 0,
    currency: Currency.USD
  },
  {
    type: PlanType.BASIC,
    price: 0,
    tokens: 0,
    currency: Currency.USD
  },
  {
    type: PlanType.PREMIUM,
    price: 0,
    tokens: 0,
    currency: Currency.USD
  },
  {
    type: PlanType.FREE,
    price: 0,
    tokens: 0,
    currency: Currency.RUB
  },
  {
    type: PlanType.BASIC,
    price: 0,
    tokens: 0,
    currency: Currency.RUB
  },
  {
    type: PlanType.PREMIUM,
    price: 0,
    tokens: 0,   
    currency: Currency.RUB
  },
  {
    type: PlanType.ELITE,
    price: 0,
    tokens: 0,    
    currency: Currency.RUB
  },
  {
    type: PlanType.ELITE,
    price: 0,
    tokens: 0,   
    currency: Currency.USD
  },
  {
    type: PlanType.ELITE,
    price: 0,
    tokens: 0,  
    currency: Currency.EUR
  }
]

const prisma = new PrismaClient({
  datasources:{
    db: {
      url: process.env.DATABASE_URL as string
    }
  }
})
async function main() {

  const jobs = []

  for(let i=0; i<plans.length; i++){
    const plan = plans[i]
    jobs.push(prisma.plan.upsert({
      where: {
        planUnique: {
          type: plan.type,
          currency: plan.currency
        }
      },
      create: plan,
      update: {}
    })
    )
  }

  const p = await Promise.all(jobs)

  const users = []

  for(let i=0; i<100; i++){
    users.push(prisma.user.create({
      data:{
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: Role.USER,
        subscription: {
          create: {
            tokens: Math.floor(Math.random() * 100_000),
            plan_id: p[Math.floor(Math.random() * plans.length)].id
          }
        }
      }
    }))
  }

  await Promise.all(users)
}
main()
  .then(()=>{
    console.log('Successfully seeded')
  })
  .catch((e)=>{
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
