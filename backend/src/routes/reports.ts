import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Balanço Financeiro / DRE Eclesiástico para Assembleia
router.get('/financial-statement', async (req, res) => {
  try {
    const { churchId, startDate, endDate } = req.query;
    const where: any = {};
    if (churchId) where.churchId = String(churchId);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = String(startDate);
      if (endDate) where.date.lte = String(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        church: { select: { name: true, city: true, pastorName: true } },
        member: { select: { name: true } },
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === 'RECEITA') {
        totalIncome += t.amount;
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      } else if (t.type === 'DESPESA') {
        totalExpense += t.amount;
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;

    // Busca dados da congregação
    let churchInfo = null;
    if (churchId) {
      churchInfo = await prisma.church.findUnique({
        where: { id: String(churchId) },
        select: { name: true, city: true, state: true, pastorName: true, address: true },
      });
    }

    res.json({
      period: {
        startDate: startDate || 'Início',
        endDate: endDate || 'Hoje',
      },
      church: churchInfo || { name: 'Todas as Congregações (Consolidado Estadual)' },
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        transactionsCount: transactions.length,
      },
      incomeByCategory: Object.entries(incomeByCategory).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : '0',
      })),
      expenseByCategory: Object.entries(expenseByCategory).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0',
      })),
      recentTransactions: transactions.slice(-20),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
