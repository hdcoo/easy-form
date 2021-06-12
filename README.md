## form-tools

### FormAccess
约束子组件中 Form.Item 的 name 属性
```typescript jsx
import {useCallback} from "react";
import {Form} from "antd";
import {FormAccess} from "@alife/form-tools";

const UserInfo = () => {
  return (
    <>
      <Form.Item name="email">
        <Input/>
      </Form.Item>
      <Form.Item name="username">
        <Input/>
      </Form.Item>
    </>
  )
}

const MyForm = () => {
  const handleValueChange = useCallback((store) => {
    // store = { name: 'xx', userInfo: { email: 'xx', username: 'xx' }}
  }, []);

  return (
    <Form onValuesChange={handleValueChange}>
      <Form.Item name="name">
        <Input/>
      </Form.Item>

      <FormAccess name="userInfo">
        <UserInfo/>
      </FormAccess>
    </Form>
  )
}
```

### useLocalForm
随时随地取得 form 实例，并且操作范围受 FormAccess 影响，可通过 mode 或 upward 改变操作范围

#### 定义
```typescript
type NamePath = string | number | Array<string | number>;

interface Options {
  // 可指定一个 namePath，操作范围将会约束到该 namePath 以下
  basePath?: NamePath;
  // global 即从顶向下搜索，local 是从本层级向下搜索（受 FormAccess 影响）
  mode?: 'global' | 'local';
  // 向上回溯 upward 层
  upward?: number;
}

declare function useLocalForm(options: Options);
```
#### 用法
```typescript jsx
import {useCallback, useEffect} from "react";
import {Form} from "antd";
import {FormAccess, useLocalForm} from "@alife/form-tools";

const UserInfo = () => {
  // localForm 受 FormAccess 影响，操作范围已约束到 userInfo 之下
  // topForm 就是 antd form 实例，少了 scrollToField 方法而已
  const [localForm, topForm] = useLocalForm();

  useEffect(() => {
    localForm.getFieldValue('email'); // 获取的是 userInfo.email 的内容
    
    localForm.dispatchValue('email', 'huang.hdc@alibaba-inc.com'); // 更改的是 userInfo.email 的内容
    
    localForm.setFieldsValue({  // 更改的是 userInfo.username 的值
      username: 'hdc',
    });
    
    topForm.getFieldValue('userInfo'); // 获取的是 userInfo 下的所有内容
  }, []);

  return (
    <>
      <Form.Item name="email">
        <Input/>
      </Form.Item>
      <Form.Item name="username">
        <Input/>
      </Form.Item>
    </>
  )
}

const MyForm = () => {
  return (
    <Form onValuesChange={handleValueChange}>
      <Form.Item name="name">
        <Input/>
      </Form.Item>

      <FormAccess name="userInfo">
        <UserInfo/>
      </FormAccess>
    </Form>
  )
}
```

### useFieldsChange
监听表单中值的变化，namePath 搜索范围受 FormAccess 影响，可通过第三个参数中的 mode 或 upward 更改搜索范围

#### 定义
```typescript
type NamePath = string | number | Array<string | number>;
type Trigger = 'contain' | 'exact' | 'lower' | 'all';

interface Options {
  // global 即从顶向下搜索，local 是从本层级向下搜索（受 FormAccess 影响）
  mode?: 'global' | 'local';
  // 向上回溯 upward 层，再向下搜索
  upward?: number;
  // 是否立即触发，否则会在下一轮更新触发（默认 false，建议不要更改，除非回调中完全没有副作用）
  immediate?: boolean;
  // contain 表示 当监听路径或该路径任意一个直接父路径发生变更时，都触发
  // exact 表示 当且仅当监听路径发生变更时触发（默认）
  // lower 表示 当监听路径和该路径的子路径发生变更时触发
  // all 表示 无论哪里发生变更，都触发
  trigger?: Trigger;
}

declare function useFieldsChange<T extends any[]>(
  callback: (after: T, before: T) => void,
  dependencies: NamePath,
  options: Options,
);
```
#### 用法
```typescript jsx
import {Form, Input} from "antd";
import {useFieldsChange} from "@alife/form-tools";

const MyComponents = () => {
  useFieldsChange<[string, string]>((
    [curName, curEmail],
    [prevName, prevEmail],
  ) => {
    // 监听 name 和 userInfo.email 的变化
  }, ['name', ['userInfo', 'email']]);

  return (
    <>
      <Form.Item name="name">
        <Input />
      </Form.Item>
      <Form.Item name={['userInfo', 'email']}>
        <Input />
      </Form.Item>
      <Form.Item name={['userInfo', 'username']}>
        <Input />
      </Form.Item>
    </>
  )
}
```

### useFieldsValue
获取表单中的某些值，当这些值变化时更新组件。namePath 搜索范围受 FormAccess 影响，可通过 mode 或 upward 改变搜索范围

#### 定义
```typescript
type NamePath = string | number | Array<string | number>;

interface Options {
  // 想要获取的值
  names: NamePath[];
  // global 即从顶向下搜索，local 是从本层级向下搜索（受 FormAccess 影响）
  mode?: 'global' | 'local';
  // 向上回溯 upward 层，再向下搜索
  upward?: number;
  // 同上
  trigger?: Trigger;
}

declare function useFieldsValue<T extends any[]>(options: Options): T;
```
#### 用法
```typescript jsx
import {Form, Input} from "antd";
import {useFieldsValue} from "@alife/form-tools";

const MyComponents = () => {
  // 获取 name 和 userInfo.email 的值，并在这两个值变化时触发该组件更新
  const [name, email] = useFieldsValue({
    names: ['name', ['userInfo', 'email']]
  });

  return (
    <>
      <Form.Item name="name">
        <Input/>
      </Form.Item>
      <Form.Item name={['userInfo', 'email']}>
        <Input/>
      </Form.Item>
      <Form.Item name={['userInfo', 'username']}>
        <Input/>
      </Form.Item>
    </>
  )
}
```

### FormList
接口与 antd FormList 基本一致，解决了使用 FormList 后，调用 form.getFieldsValue() 时会把隐藏的值也一起取出的问题
```typescript jsx
import {Form, Input} from "antd";
import {useCallback} from "react";
import {FormList, IFieldInfo, IFormListOperators} from "@alife/form-tools";


const MyComponents = () => {
  const renderer = useCallback((
    fields: IFieldInfo[],
    { add }: IFormListOperators,
  ) => {
    return (
      <>
        {fields.map((field, index) => (
          <>
            <Form.Item name={[index, 'email']}>
              <Input />
            </Form.Item>
            <Form.Item name={[index, 'username']}>
              <Input />
            </Form.Item>
          </>
        ))}
      </>
    )
  }, []);

  return (
    <>
      <FormList name="users">
        {renderer}
      </FormList>
    </>
  )
}
```

### createList
包装某个表单层级组件，使之具备数组结构。内部使用 FormList 实现
```typescript jsx
import {Button, Form, Input} from "antd";
import {useCallback, useRef} from "react";
import {IFormListOperators, createList} from "@alife/form-tools";

interface IUserInfo {
  email: string;
  username: string;
}

interface UserInfoProps {
  index?: number;
  onRemove?(index: number): void;
}

const UserInfo = (props: UserInfoProps) => {
  const {onRemove, index} = props;
  
  // 内部调用 onRemove 触发删除
  const handleRemove = useCallback(() => {
    if (onRemove && typeof index === 'number') {
      onRemove(index);
    }
  }, [onRemove, index]);
  
  return (
    <>
      <Form.Item name="email">
        <Input/>
      </Form.Item>
      <Form.Item name="username">
        <Input/>
      </Form.Item>
      <Button>删除</Button>
    </>
  )
}

// 调用 createList 创建一个新的组件
const UserInfoList = createList(UserInfo);

const MyForm = () => {
  const ref = useRef<IFormListOperators<Partial<IUserInfo>>>();

  const handleAdd = useCallback(() => {
    ref.current?.add({ // 初始值，可以什么也不给
      email: 'huang.hdc@alibaba-inc.com'
    });
  }, []);
  
  const handleRemove = useCallback((index: number) => {
    ref.current?.remove(index);
  }, []);
  
  const handleValueChange = useCallback((store) => {
    // store = { name: '..', useInfoList: [{ email: '..', username: '..' }, ...]}
  }, []);

  return (
    <Form onValuChange={handleValueChange}>
      <Form.Item name="name">
        <Input/>
      </Form.Item>

      <Button onClick={handleAdd}>添加</Button>

      <UserInfoList
        ref={ref}
        listProps={{name: 'userInfoList'}}
        onRemove={handleRemove}
      />
    </Form>
  );
}
```

### renderList
自定义列表渲染

```typescript jsx
import {useCallback, useRef} from "react";
import {Button, Form, Input} from "antd";
import {IFieldInfo, IFormListOperators, renderList} from "@alife/form-tools";

interface IUserInfo {
  email: string;
  username: string;
}

interface UserInfoProps {
  index?: number;
  onRemove?(index: number): void;
}

const UserInfo = (props: UserInfoProps) => {
  const {onRemove, index} = props;

  // 内部调用 onRemove 触发删除
  const handleRemove = useCallback(() => {
    if (onRemove && typeof index === 'number') {
      onRemove(index);
    }
  }, [onRemove, index]);

  return (
    <>
      <Form.Item name="email">
        <Input/>
      </Form.Item>
      <Form.Item name="username">
        <Input/>
      </Form.Item>
      <Button>删除</Button>
    </>
  )
}

// renderList 接受一个 renderProps，前两个参数和 FormList 的 renderProps 一模一样，第三个参数是上层传递下来的 额外 props
const UserInfoList = renderList((
  fields: Array<IFieldInfo<Partial<IUserInfo>>>,
  operators: IFormListOperators<Partial<IUserInfo>>,
  itemProps: any // 此处为 itemProps 类型
) => {
  const handleAdd = useCallback(() => {
    operators.add({ // 初始值，可以什么也不给
      email: 'huang.hdc@alibaba-inc.com'
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    operators.remove(index);
  }, []);
  
  return (
    <>
      <Button onClick={handleAdd}>添加</Button>
      {fields.map((field) => (
        <UserInfo
          index={index}
          onRemove={handleRemove}
          {...itemProps}
        />
      ))}
    </>
  )
});


const MyForm = () => {
  const ref = useRef<IFormListOperators<Partial<IUserInfo>>>();

  const handleValueChange = useCallback((store) => {
    // store = { name: '..', useInfoList: [{ email: '..', username: '..' }, ...]}
  }, []);

  return (
    <Form onValuChange={handleValueChange}>
      <Form.Item name="name">
        <Input/>
      </Form.Item>

      <Button onClick={handleAdd}>添加</Button>

      <UserInfoList
        // listProps 是给内部 FormList 使用的
        listProps={{name: 'userInfoList'}}
        // itemProps 是传递给 list 中的每一个 item 的
        itemProps={...}
      />
    </Form>
  );
}

```

### inject
向组件内注入其他组件，可用于数据层级解耦

#### 定义

```typescript jsx
import React from "react";

interface Slots {
  formSlots: React.ComponentType[];
}

declare function inject<P>(Component: React.ComponentType<P> & Slots, slots: React.ComponentType[]): React.ComponentType<P>;
```

#### 用法

```typescript jsx
import React, {useCallback} from "react";
import {Form, Input} from "antd";
import {inject} from "@alife/form-tools";

interface UserInfoProps {
  formSlots?: React.ComponentType[];
}

const UserInfo = (props: UserInfoProps) => {
  const {formSlots} = props;
  const [Slot] = formSlots || [];

  return (
    <>
      <Form.Item name="email">
        <Input/>
      </Form.Item>
      {Slot && <Slot/>}
    </>
  )
}

const Username = () => {
  return (
    <>
      <Form.Item name="username">
        <Input/>
      </Form.Item>
    </>
  )
}

// 向 UserInfo 中注入 Username 组件
const UserInfoWithUsername = inject(UserInfo, [Username]);

const MyForm = () => {
  const handleValueChange = useCallback((store) => {
    // store = {email: '...', username: '...'}
  }, []);

  return (
    <Form onValueChange={handleValueChange}>
      <UserInfoWithUsername/>
    </Form>
  )
}

```

### createForm
原来使用 inject 一层一层创建出表单内容，此方法接管了表单的创建，给一个配置，说明依赖关系即可

#### 用法
```typescript jsx
import {createForm, createList} from '@alife/form-tools';

const FormContent = createForm({
  entry: {
    component: Entry,
    dependencies: ['level1'],
  },
  modules: [{
    name: 'level1',
    component: Level1,
    decorators: [createList],
  }]
});
```
