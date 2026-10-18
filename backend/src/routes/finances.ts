import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Resumo financeiro (KPIs e Gráficos de Fluxo de Caixa)
router.get('/summary', async (req, res) => {
  try {
    const { churchId, month, year } = req.query;
    const currentYear = year ? String(year) : String(new Date().getFullYear());
    const currentMonth = month ? String(month).padStart(2, '0') : String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `${currentYear}-${currentMonth}`;

    const where: any = {
      date: { startsWith: prefix },
    };
    if (churchId) where.churchId = String(churchId);

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        member: { select: { name: true } },
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory: Record<string, number> = {};

    for (const t of transactions) {
      if (t.type === 'RECEITA') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }

      if (!byCategory[t.category]) {
        byCategory[t.category] = 0;
      }
      byCategory[t.category] += t.amount;
    }

    const netBalance = totalIncome - totalExpense;

    // Resumo dos últimos 6 meses para o gráfico
    const monthlyHistory = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const yStr = String(d.getFullYear());
      const p = `${yStr}-${mStr}`;

      const historyWhere: any = { date: { startsWith: p } };
      if (churchId) historyWhere.churchId = String(churchId);

      const monthTrans = await prisma.transaction.findMany({ where: historyWhere });
      const inc = monthTrans.filter(t => t.type === 'RECEITA').reduce((acc, cur) => acc + cur.amount, 0);
      const exp = monthTrans.filter(t => t.type === 'DESPESA').reduce((acc, cur) => acc + cur.amount, 0);

      monthlyHistory.push({
        month: `${mStr}/${yStr.slice(2)}`,
        receitas: inc,
        despesas: exp,
        saldo: inc - exp,
      });
    }

    res.json({
      period: prefix,
      totalIncome,
      totalExpense,
      netBalance,
      byCategory,
      monthlyHistory,
      recentTransactions: transactions.slice(0, 15),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Listar lançamentos (suporta / e /transactions)
const listTransactionsHandler = async (req: any, res: any) => {
  try {
    const { churchId, type, category, startDate, endDate } = req.query;

    const where: any = {};
    if (churchId) where.churchId = String(churchId);
    if (type) where.type = String(type);
    if (category) where.category = String(category);
    if (startDate && endDate) {
      where.date = { gte: String(startDate), lte: String(endDate) };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        church: { select: { name: true } },
        member: { select: { id: true, name: true, phone: true } },
      },
      take: 100,
    });

    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

router.get('/', listTransactionsHandler);
router.get('/transactions', listTransactionsHandler);

// Criar lançamento (Dízimo, Oferta ou Despesa)
const createTransactionHandler = async (req: any, res: any) => {
  try {
    const data = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        churchId: data.churchId,
        memberId: data.memberId || null,
        type: data.type, // RECEITA ou DESPESA
        category: data.category, // DIZIMO, OFERTA, ALUGUEL, ETC
        amount: parseFloat(data.amount),
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description,
        paymentMethod: data.paymentMethod || 'PIX',
        status: data.status || 'CONCLUIDO',
      },
    });

    res.status(201).json(transaction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

router.post('/', createTransactionHandler);
router.post('/transactions', createTransactionHandler);

// Excluir lançamento (suporta /:id e /transactions/:id)
const deleteTransactionHandler = async (req: any, res: any) => {
  try {
    await prisma.transaction.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Lançamento excluído com sucesso' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

router.delete('/:id', deleteTransactionHandler);
router.delete('/transactions/:id', deleteTransactionHandler);

export default router;
