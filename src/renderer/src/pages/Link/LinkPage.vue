<template>
    <div class="flex flex-col w-full min-h-scree">
        <div class="p-[20px]">
            <div class="text-[20px]">导入/导出</div>
            <div class="mt-5">
                <el-select v-model="value" placeholder="选择一个图库" style="width: 240px;" clearable multiple collapse-tags
                    collapse-tags-tooltip :max-collapse-tags="2">
                    <el-option v-for="item in option" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <el-button type="primary" class="ml-3">导出JSON</el-button>
            </div>
            <div class="mt-5">
                <el-table :data="tableData" style="width: 100%" height="100%">
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="name" label="预览图" width="120">
                        <template v-slot:default="scope">
                            <img :src="scope.row.url" alt="image" width="100" height="100" class="w-[100px] h-[100px] object-cover object-center overflow-hidden" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" label="名字" width="120" />
                    <el-table-column prop="author" label="画师" width="160" />
                    <el-table-column prop="time" label="交付时间" width="180" />
                    <el-table-column prop="type" label="类型" />
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { v4 as uuid } from 'uuid'
const importAll = import.meta.glob('/src/renderer/src/assets/images/*.{jpg,jpeg,png,gif}');

const value = ref([])
//选择框数组
const option = [
  {
    value: '图库1',
    label: '图库1'
  },
  {
    value: '图库2',
    label: '图库2'
  },
  {
    value: '图库3',
    label: '图库3'
  },
  {
    value: '图库4',
    label: '图库4'
  }
]
//接收图片的数组
const tableData = [
  {
    no: uuid(),
    name: "橘橘",
    author: "ちょみます",
    authorid: "33",
    price: '12000JPY',
    url: 'src/assets/images/2025754-1.png',
    time: "2023-11-29",
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `文艺橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "琴かKotoka",
    authorid: "51",
    price: '10000JPY',
    time: "2023-11-27",
    url: 'src/assets/images/PSD.jpg',
    // multiImg: GetImgs(i, ["1770696-1.jpg", "1770696-2.jpg", "1770696-3.jpg", "1770696-4.jpg","1770696-5.jpg"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "FeeCHaNN",
    authorid: "34",
    price: '400RMB',
    time: "2023-12-1",
    url: 'src/assets/images/2025754-1.png',
    // multiImg: GetImgs(i, ["1770696-1.jpg", "1770696-2.jpg", "1770696-3.jpg", "1770696-4.jpg","1770696-5.jpg"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "azureine",
    authorid: "53",
    price: '400RMB',
    time: "2023-12-4",
    url: 'src/assets/images/PSD.jpg',
    // multiImg: GetImgs(i, ["1770696-1.jpg", "1770696-2.jpg", "1770696-3.jpg", "1770696-4.jpg","1770696-5.jpg"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "Mira吟_",
    authorid: "54",
    price: '290RMB',
    time: "2023-10-31",
    // multiImg: GetImgs(i, ["1770696-1.jpg", "1770696-2.jpg", "1770696-3.jpg", "1770696-4.jpg","1770696-5.jpg"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "Mira吟_",
    authorid: "54",
    price: '390RMB',
    time: "2023-12-12",
    // multiImg: GetImgs(i, ["1770696-1.jpg", "1770696-2.jpg", "1770696-3.jpg", "1770696-4.jpg","1770696-5.jpg"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "Znx锌",
    authorid: "55",
    price: '633RMB',
    time: "2023-12-29",
    // multiImg: GetImgs(i, ["1770696-1.jpg", "1770696-2.jpg", "1770696-3.jpg", "1770696-4.jpg","1770696-5.jpg"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "瑞蓓塔",
    authorid: "56",
    price: '400RMB',
    time: "2023-12-31",
    // multiImg: GetImgs(i, ["1770696-1.jpg", "1770696-2.jpg", "1770696-3.jpg", "1770696-4.jpg","1770696-5.jpg"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "雪見しの❄️",
    authorid: "45",
    price: '21000JPY',
    time: "2023-12-31",
    // multiImg: GetImgs(i, ["1670789-1.png", "1670789-3.png"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "もち",
    authorid: "57",
    price: '25000JPY',
    time: "2024-01-03",
    // multiImg: GetImgs(i, ["1670789-1.png", "1670789-3.png"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "じっぽ🐺コミティア",
    authorid: "58",
    price: '20000JPY',
    time: "2024-01-05",
    // multiImg: GetImgs(i, ["1670789-1.png", "1670789-3.png"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "ころんびぁ☕️",
    authorid: "29",
    price: '8000JPY',
    time: "2024-01-07",
    // multiImg: GetImgs(i, ["1670789-1.png", "1670789-3.png"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `橘猫`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "嵐屋",
    authorid: "59",
    price: '15000JPY',
    time: "2024-01-08",
    // multiImg: GetImgs(i, ["1670789-1.png", "1670789-3.png"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `和枫铃的贴贴图`
  },
  {
    no: uuid(),
    name: "橘橘",
    author: "箩莉即正义",
    authorid: "60",
    price: '1400RMB',
    time: "2024-01-08",
    // multiImg: GetImgs(i, ["1670789-1.png", "1670789-3.png"]),
    type: "illustration",
    tag: [
      { tno: 1, tname: "1girl" },
      { tno: 2, tname: "橘猫" },
    ],
    intrduce: `和food的贴贴图，AA`
  },
]
</script>
<style scoped>
:deep(.el-select) {
    width: 100%;
}
</style>