// 导入数据到MySQL的脚本
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// 读取websites.ts文件
const websitesFilePath = path.join(process.cwd(), 'src/app/data/websites.ts');
const websitesContent = fs.readFileSync(websitesFilePath, 'utf8');

// 提取数据
const dataMatch = websitesContent.match(/export const websitesData = (\{[\s\S]*\});/);
if (!dataMatch) {
  console.error('无法提取网站数据');
  process.exit(1);
}

const websitesData = eval(`(${dataMatch[1]})`);

// 导入数据到MySQL
async function importData() {
  try {
    console.log('开始导入数据到MySQL...');
    
    // 使用后端的seed API导入数据
    const response = await axios.post('http://localhost:3000/api/seed', {
      data: websitesData
    });
    
    console.log('数据导入成功:', response.data);
    
    // 验证数据是否导入成功
    const verifyResponse = await axios.get('http://localhost:3000/api/websites');
    console.log('验证数据导入结果:', verifyResponse.data);
    
  } catch (error) {
    console.error('数据导入失败:', error.message);
  }
}

// 运行导入
importData();
