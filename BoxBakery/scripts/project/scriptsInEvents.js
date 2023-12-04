


const scriptsInEvents = {

	async Main_Event27_Act1(runtime, localVars)
	{
		const {token, items} = localVars;
		const index = items.split(',').map((item, index) => item.trim() === token ? index : -1).filter(index => index !== -1);
		runtime.setReturnValue(index);
	},

	async Main_Event28_Act1(runtime, localVars)
	{
		const { token, items } = localVars;
		const itemString = typeof items === 'string' ? items : '';
		const exists = itemString.split(',').some(item => item.trim() === token);
		runtime.setReturnValue(exists);
	},

	async Main_Event31_Act1(runtime, localVars)
	{
		const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
		const shopData = runtime.objects.ShopData.getFirstInstance().getJsonDataCopy();
		const ingredients = playerData.Ingredients;
		
		const filterItems = {
		    category: localVars.category,
		    items: shopData.filter(({ ItemID, Category, UnlockLevel, Stock, isUnique }) => 
		        Category === localVars.category && 
		        UnlockLevel <= localVars.level &&
		        (typeof Stock === 'number' ? Stock > 0 : Stock === '') &&
		        (!isUnique || !(ItemID in ingredients)) 
		    )
		};
		
		runtime.setReturnValue(JSON.stringify(filterItems));
	},

	async Main_Event32_Act1(runtime, localVars)
	{
		const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
		const itemsData = runtime.objects.ShopData.getFirstInstance().getJsonDataCopy();
		
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

	async Main_Event50_Act1(runtime, localVars)
	{
		const { itemID, itemKey } = localVars;
		if (itemKey === "ItemStock") {
			const playerData = runtime.objects.PlayerData.getFirstInstance().getJsonDataCopy();
			const stock = playerData.Ingredients[itemID] || 0;
			runtime.setReturnValue(stock);
		} else {
			const shopData = runtime.objects.ShopData.getFirstInstance().getJsonDataCopy();
			const itemData = shopData.find(item => item.ItemID === itemID);
			let data = itemData ? itemData[itemKey] : "null";
			runtime.setReturnValue(data);
		}
	},

	async Main_Event51_Act1(runtime, localVars)
	{
		const shopData = runtime.objects.ShopData.getFirstInstance().getJsonDataCopy();
		const itemData = shopData.find(item => item.ItemID === localVars.itemID);
		runtime.setReturnValue(JSON.stringify(itemData));
	},

	async Main_Event52_Act1(runtime, localVars)
	{
		const { category, filterItemStock, filterEmptyItems } = localVars;
		const ingredients = runtime.objects.Inventory.getFirstInstance().getJsonDataCopy()[category] || {};
		
		const result = filterItemStock ?  Object.values(ingredients).reduce((sum, value) => sum + value, 0) :
		  filterEmptyItems ? Object.values(ingredients).filter(value => value > 0).length : Object.keys(ingredients).length;
		
		runtime.setReturnValue(result);
	},

	async Main_Event53_Act1(runtime, localVars)
	{
		const categoryIconMap = {
			"原料": "Item",
			"天然": "Item",
			"半成品": "Food",
			"家具": "Furniture",
			"工具": "Furniture",
			"动物": "Animal"
		};
		
		const objectTypeName = "icon" + (categoryIconMap[localVars.category] || "Item");
		runtime.setReturnValue(objectTypeName);
	},

	async Main_Event55_Act1(runtime, localVars)
	{
		// 获取 CookFormula 数据
		const cookFormula = runtime.objects.CookFormula.getFirstInstance().getJsonDataCopy();
		
		// 从 localVars 中获取 formula 和 filterMethod
		const { formula, filterMethod } = localVars;
		
		// 辅助函数：检查是否包含所需食材
		const hasAllIngredients = (selectedKeys, targetIngredients) =>
		  selectedKeys.every(key => targetIngredients.includes(key) && selectedIngredients[key] <= targetIngredients.filter(i => i === key).length);
		
		// 辅助函数：匹配食谱
		const matchIngredients = (selectedIngredients, filterMethod = false) =>
		  cookFormula.filter(({ Ingredients, Mixing, Method }) => {
		    const selectedKeys = Object.keys(selectedIngredients);
		
		    return filterMethod
		      ? hasAllIngredients(selectedKeys, Ingredients)
		      : hasAllIngredients(selectedKeys, Ingredients) && Mixing === selectedIngredients.Mixing && Method === selectedIngredients.Method;
		  });
		
		// 解析 formula 字符串为对象
		const selectedIngredients = JSON.parse(formula);
		
		// 匹配食谱
		const matchItems = matchIngredients(selectedIngredients, filterMethod);
		
		// 返回匹配结果
		runtime.setReturnValue(JSON.stringify(matchIngredients["Name"]));
	},

	async Main_Event445_Act1(runtime, localVars)
	{
		const { size, data } = JSON.parse(localVars.c3ArrayFile);
		const [, totalRows] = size;
		
		const columnHeaders = data.map(column => column[0][0].trim());
		const output = [];
		
		for (let rowIndex = 1; rowIndex < totalRows; rowIndex++) {
		  const rowObject = Object.fromEntries(
		    columnHeaders.map((header, columnIndex) => {
		      if (!header) return [header, ""];
		      const cellValue = data[columnIndex][rowIndex][0];
		      return [header, typeof cellValue === 'string' ? cellValue.trim() : cellValue];
		    })
		  );
		
		  if (Object.values(rowObject).some(value => value !== "")) {
		    output.push(rowObject);
		  }
		}
		
		runtime.setReturnValue(JSON.stringify(output));
	},

	async Main_Event446_Act1(runtime, localVars)
	{
		let cookbookData = JSON.parse(localVars.c3convertJSON);
		
		const cookFormula = cookbookData.map(item => {
		  const { ItemID, Name, Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5, Mixing, Method } = item;
		  const ingredients = [Ingredient1, Ingredient2, Ingredient3, Ingredient4, Ingredient5].filter(Boolean);
		  return { ItemID, Name, Ingredients: ingredients, Mixing, Method };
		});
		
		runtime.setReturnValue(JSON.stringify(cookFormula));
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

