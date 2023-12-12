


const scriptsInEvents = {

	async Main_Event28_Act1(runtime, localVars)
	{
		const {token, items} = localVars;
		const index = items.split(',').map((item, index) => item.trim() === token ? index : -1).filter(index => index !== -1);
		runtime.setReturnValue(index);
	},

	async Main_Event29_Act1(runtime, localVars)
	{
		const { token, items } = localVars;
		const itemString = typeof items === 'string' ? items : '';
		const exists = itemString.split(',').some(item => item.trim() === token);
		runtime.setReturnValue(exists);
	},

	async Localstorage_Event24_Act1(runtime, localVars)
	{
		const { size, data } = JSON.parse(localVars.c3ArrayFile);
		const [, totalRows] = size;
		
		const columnHeaders = data.map(column => column[0][0].trim());
		const output = [];
		
		for (let rowIndex = 1; rowIndex < totalRows; rowIndex++) {
		  const rowObject = Object.fromEntries(
		    columnHeaders.map((header, columnIndex) => {
		      const cellValue = data[columnIndex][rowIndex][0];
		      return [header, (typeof cellValue === 'string' ? cellValue.trim() : cellValue) || ""];
		    })
		  );
		
		  const commentValue = data[0][rowIndex][0];
		  const isCommentRow = Object.values(rowObject).every(value => value === "");
		
		  // 检查行是否为注释行或全为空，如果是则跳过
		  if (!isCommentRow && typeof commentValue === 'string' && !commentValue.includes("::")) {
		    output.push(rowObject);
		  }
		}
		
		runtime.setReturnValue(JSON.stringify(output));
	},

	async Localstorage_Event25_Act1(runtime, localVars)
	{
		const cookbookData = JSON.parse(localVars.c3convertJSON);
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		
		const getIngredientId = (ingredientName) => (itemsData.find(item => item.Name === ingredientName) || {}).ItemID || ingredientName;
		
		const cookFormula = cookbookData.map(({ ItemID, Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5, Mixing, Method }) => {
		  const ingredients = [Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5].filter(Boolean).map(getIngredientId);
		  return { ItemID, Ingredients: ingredients, Mixing, Method };
		});
		
		runtime.setReturnValue(JSON.stringify(cookFormula));
	},

	async Localstorage_Event26_Act1(runtime, localVars)
	{
		const cookbookData = JSON.parse(localVars.c3convertJSON);
		
		const cookbookObject = cookbookData.reduce((acc, recipe) => {
		    const { ItemID, Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5, ...rest } = recipe;
		    const ingredients = [Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5].filter(Boolean);
		    acc[ItemID] = { ItemID, Ingredients: ingredients, ...rest };
		    return acc;
		}, {});
		
		runtime.setReturnValue(JSON.stringify(cookbookObject));
	},

	async Data_Event3_Act1(runtime, localVars)
	{
		const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		const ingredients = playerData.Ingredients || {};
		
		const { category, level } = localVars;
		
		const filterItems = {
		    category: category,
		    items: itemsData.filter(({ ItemID, Category, UnlockLevel, ShopStock, isUnique }) => 
		        Category === category && UnlockLevel <= level &&
		        (typeof ShopStock === 'number' ? ShopStock > 0 : ShopStock === '') &&
		        (!isUnique || !(ItemID in ingredients)) 
		    )
		};
		
		runtime.setReturnValue(JSON.stringify(filterItems));
	},

	async Data_Event5_Act1(runtime, localVars)
	{
		const { itemID, itemKey } = localVars;
		if (itemKey === "ItemStock") {
			const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
			const ingredients = playerData.Ingredients || {};
			const stock = ingredients[itemID] || 0;
			runtime.setReturnValue(stock);
		} else {
			const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
			const itemData = itemsData.find(item => item.ItemID === itemID) || {};
			let data = itemData ? itemData[itemKey] : "None";
			runtime.setReturnValue(data);
		}
	},

	async Data_Event6_Act1(runtime, localVars)
	{
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		const itemID = localVars.itemID;
		const itemData = itemsData.find(item => item.ItemID === itemID) || null;
		runtime.setReturnValue(JSON.stringify(itemData));
	},

	async Data_Event7_Act1(runtime, localVars)
	{
		const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
		const itemsData = runtime.objects.ItemsData.getFirstInstance().getJsonDataCopy();
		
		let output = {};
		
		for (let itemID in playerData.Ingredients) {
		
		    // 查找对应的物品数据
		    let itemData = itemsData.find(item => item.ItemID === itemID);
			
		    // 确定物品分类，如果没有找到则归类为'其他'
		    let category = itemData ? itemData.Category : "其他"; 
		
		    // 确保该分类的数据结构已初始化
		    output[category] = output[category] || {};
			
		    // 将物品及其数量添加到相应分类
		    output[category][itemID] = playerData.Ingredients[itemID];
		}
		
		// 将分类后的库存数据作为返回值
		runtime.setReturnValue(JSON.stringify(output));
	},

	async Data_Event8_Act1(runtime, localVars)
	{
		const { category, filterItemStock, filterEmptyItems } = localVars;
		
		const ingredients = runtime.objects.InventoryData.getFirstInstance().getJsonDataCopy()[category] || {};
		const ingredientValues = Object.values(ingredients);
		
		const result = 
		  filterItemStock ? ingredientValues.reduce((sum, value) => sum + value, 0) : 
		  filterEmptyItems ? ingredientValues.filter(value => value > 0).length : 
		  ingredientValues.length;
		
		runtime.setReturnValue(result);
	},

	async Data_Event29_Act1(runtime, localVars)
	{
		const InventorySortInst = runtime.objects.InventoryrSortData.getFirstInstance();
		const Inventory = InventorySortInst.getJsonDataCopy();
		
		for (const key in Inventory) {
		    if (Inventory.hasOwnProperty(key) && Array.isArray(Inventory[key])) {
		        Inventory[key].sort((a, b) => (typeof a === 'string' ? b.localeCompare(a) : b - a));
		    }
		}
		
		InventorySortInst.setJsonDataCopy(Inventory);
	},

	async Data_Event36_Act1(runtime, localVars)
	{
		// 获取 CookFormula 数据
		const cookFormula = runtime.objects.CookFormula.getFirstInstance().getJsonDataCopy();
		
		// 从 localVars 中获取 formula 和 filterMethod
		const { formula, filterMethod } = localVars;
		
		// 解析 formula 字符串为对象
		const parsedFormula = JSON.parse(formula);
		
		// 查找匹配的食谱
		const matched = cookFormula.filter(recipe => {
		
		    // 检查食谱中的配料是否匹配
			const ingredientsMatch = Object.entries(parsedFormula.Ingredient).every(([ingredient, quantity]) => {
				return recipe.Ingredients.includes(ingredient) && recipe.Ingredients.filter(item => item === ingredient).length === quantity;
			});
			
		    // 如果 filterMethod 为 1，则只检查 ingredientsMatch
		    if (filterMethod === 1) {
		        return ingredientsMatch;
		    }
		
		    // 检查搅拌和烹饪方法是否匹配
		    const mixingMatch = recipe.Mixing === parsedFormula.Mixing;
		    const methodMatch = recipe.Method === parsedFormula.Method;
		
		    // 如果 filterMethod 不为 1 时，需要检查所有条件
		    return ingredientsMatch && mixingMatch && methodMatch;
		});
		
		// 提取匹配到的食谱 ItemID 数组
		const matchedRecipeItemIDs = matched.map(recipe => recipe.ItemID);
		
		// 返回匹配结果，如果没有匹配到则返回空数组
		runtime.setReturnValue(JSON.stringify(matchedRecipeItemIDs || "[]"));
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

