
import { Card, CardContent } from "@/components/ui/card";
import { useFinance } from "@/hooks/useFinance";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import CardHeader from "@/components/ui/atoms/CardHeader";
import CategoryBadge from "@/components/ui/atoms/CategoryBadge";

const CategoryBreakdown = () => {
  const finance = useFinance();
  const { 
    selectedCategories,
    toggleCategorySelection,
    resetCategorySelection,
    formatCurrency
  } = finance;

  // Get expense data for breakdown
  const expenseData = finance.expenseBreakdown();
  
  // Calculate total expense
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
  
  // Check if we have any data
  const hasData = expenseData.length > 0;

  return (
    <Card className="h-full">
      <CardHeader 
        title="Despesas por Categoria" 
        description={hasData ? formatCurrency(totalExpenses) : "Sem dados para o período"}
      />
      
      <CardContent>
        {hasData ? (
          <div className="flex flex-col space-y-3">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={
                          selectedCategories.includes(entry.name)
                            ? "#fff"
                            : "transparent"
                        }
                        strokeWidth={selectedCategories.includes(entry.name) ? 2 : 0}
                        style={{
                          filter: selectedCategories.includes(entry.name)
                            ? "drop-shadow(0 0 4px rgba(255,255,255,0.5))"
                            : selectedCategories.length > 0
                            ? "opacity(0.7)"
                            : "none",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {expenseData.map((category) => (
                <CategoryBadge
                  key={category.name}
                  name={category.name}
                  color={category.color}
                  isSelected={selectedCategories.includes(category.name)}
                  onClick={() => toggleCategorySelection(category.name)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-center text-muted-foreground">
            <p>Sem despesas registradas para este mês.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
