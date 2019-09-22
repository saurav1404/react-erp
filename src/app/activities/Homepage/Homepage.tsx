import { Button, Card, Divider, Input, InputNumber, Form , Table} from 'antd';
import * as React from 'react';
import {useEffect, useState}  from 'react';
import axios from 'axios';
import * as _ from "lodash";

const { Column } = Table;

type HomepageProps = {
  classNames: any;
  image: string;
};

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  state = {
    editing: false,
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `${title} is required.`,
            },
          ],
          initialValue: record[dataIndex],
        })(<Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />)}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

export default function Homepage(props: HomepageProps) {

  const [columns, setColumn] = useState([]);
  const [row, setRow] = useState([]);
  const [currentRow, setCurrentRow] = useState(null);

  useEffect(() => {
    getColumns();
  }, [props]);

  function getColumns(){
    axios.get(`http://localhost:5000/api/config`).then(res => {
      let workflowColumn = _.find(res.data, function(o){ return o.title === 'Workflow status'});
      _.forEach(workflowColumn.columns, function(value){
        value.editable = true;
      });
      let action = {
        dataIndex: 'action',
        title: 'Action',
        label: 'Action',
        key: 'last',
        id: "last",
        visible: true,
        render: (text, record) => (
          <span>
            {record.new === true &&
              <span>
                <Button className="action-icon" type="primary" size="small" icon="save" onClick={() => saveRow(record)}/>
              </span>
            }  
            {!record.new &&
              <span>
                <Button className="action-icon" type="primary" size="small" icon="edit" onClick={() => saveRow(record)}/>
                <Divider type="vertical" />
                <Button className="action-icon" type="primary" size="small" icon="delete" onClick={() => deleteRow(record)}/>
              </span>
            }  
          </span>
        ),
      };
      workflowColumn.columns.push(action);
      setColumn(workflowColumn.columns);
      getWorkflow();
    });
  }

  function getWorkflow(){
    axios.get(`http://localhost:5000/api/workflow`).then(res => {
      setRow(res.data);
    });
  }

  function addRow(){
    let newRow = {
      "new": true,
      "RelId": "",
      "EntityType": "",
      "DseDsCode": "",
      "OdsStatus": "",
      "GplStatus": "",
      "GblStatus": "",
      "GrlStatus": "",
      "DetStatus": "",
      "GckStatus": "",
    }
    let rowData = [...row, newRow];
    setRow(rowData);
    setTimeout(() => setCurrentRow(newRow) ,1000);
  }

  function editRow(record:any){

  }

  function deleteRow(record:any){
    axios({
      url: `http://localhost:5000/api/workflow/${record.Id}`,
      method: 'DELETE',
    }).then(function(res){
      getWorkflow();
    });
  }

  function saveWorkflow(data:any){
    let index = row.length-1;
    if(index >= 0){
      row[index] = data;
      setTimeout(() => setRow(row) ,1000);
      setTimeout(() => setCurrentRow(row[index]) ,1000);
    }
  }

  function saveRow(rowData:any){
    if(rowData.new === true){
      axios({
        url: `http://localhost:5000/api/workflow/`,
        method: 'POST',
        data: rowData,
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(function(res){
        getWorkflow();
      });
    }else{
      axios({
        url: `http://localhost:5000/api/workflow/${rowData.Id}`,
        method: 'PUT',
        data: rowData,
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(function(res){
        getWorkflow();
      });
    }
  }

  function renderTitle() {
    return (
      <div className='page-header'>

      </div>
    );
  };

  function renderExtra() {
    const {} = props;
    return (
      <div className='page-header-extra'>
        <Button type="primary" onClick={addRow} style={{marginRight: '10px'}}>Add</Button>
      </div>
    );
  };

  function renderData() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    let columnData = columns.length > 0 && columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.label,
          handleSave: saveWorkflow,
          key: col.id
        }),
      };
    }) || [];
    return (
      <Table components={components} 
              rowClassName={() => 'editable-row'}
              dataSource={row}
              columns={columnData}/>
    );
  };
  
  return (
    <div className={props.classNames.homepage}>
      <div className='container-fluid'>
        <div className='row bottom-padded-row page'>
          <div className='col-lg-12'>
            <Card size='small' title={renderTitle()} extra={renderExtra()}>
              <div className='card-container'>
                <div className='card-header'>
                  <h3>Workflow Status</h3>
                </div>
                {renderData()}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
