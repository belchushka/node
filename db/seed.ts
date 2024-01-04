import { PrismaClient, Currency, Plan, PlanType, Role, Prisma, TransactionProvider, TransactionType, TransactionStatus } from '@prisma/client'
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

    const transactions: Array<Prisma.TransactionCreateManyInput> = []

    for (let i=0; i<33; i++) {
      let type = Math.random() > 0.5 ? TransactionType.WRITE_OFF : TransactionType.REPLENISH
      const amount = Math.floor(Math.random() * 20_000)

      transactions.push({
            currency: Currency.SYSTEM_TOKEN,
            type: type,
            provider: TransactionProvider.SYSTEM,
            amount: amount,
            status: Math.random() > 0.5 ? TransactionStatus.PENDING : TransactionStatus.SUCCEDED
      })
    }


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
        },
        transactions: {
          createMany: {
            data: transactions
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
