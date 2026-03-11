export interface MealIngredient {
  ingredientId: string;
  amount: number;
}

export interface Meal {
  id: string;
  name: string;
  ingredients: MealIngredient[];
}
