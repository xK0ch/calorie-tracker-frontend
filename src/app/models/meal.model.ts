export interface MealIngredient {
  ingredientId: number;
  amount: number;
}

export interface Meal {
  id: number;
  name: string;
  ingredients: MealIngredient[];
}
