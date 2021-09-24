import { FormInstance } from "antd/lib/form/hooks/useForm";
import {
  CollectionParameter,
  CollectionTemplate,
  SourceConnector,
} from "../../../../../catalog/sources/types";
import styles from "./SourceEditor.module.less";
import { FormListFieldData, FormListOperation } from "antd/es/form/FormList";
import { Button, Col, Collapse, Form, Input, Popover, Row } from "antd";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import { CaretRightOutlined } from "@ant-design/icons";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { LabelWithTooltip } from "../../../../components/LabelWithTooltip/LabelWithTooltip";
import { CodeInline } from "../../../../../lib/components/components";
import { SourceFormCollectionsField } from "./SourceFormCollectionsField";
import { getUniqueAutoIncId, randomId } from "../../../../../utils/numbers";
import * as React from "react";

const { Panel } = Collapse;

export interface Props {
  form: FormInstance;
  initialValues: SourceData;
  connectorSource: SourceConnector;
  handleTouchAnyField: (...args: any) => void;
}

const SourceEditorStreams = ({
  form,
  initialValues,
  connectorSource,
  handleTouchAnyField
}: Props) => {
  const [selectedCollectionTypes, setSelectedCollectionTypes] = useState(
    connectorSource.collectionTypes
  );
  const [addStreamVisible, setAddStreamVisible] = useState(false);
  const [addTemplateVisible, setAddTemplateVisible] = useState(false);
  const [activePanel, setActivePanel] = useState([]);
  const input = useRef(null);

  const renderAddButton = connectorSource.collectionTypes.length <= 1;
  const renderAddPopover = connectorSource.collectionTypes.length > 1;
  const renderApplyTemplates = connectorSource.collectionTemplates;

  const handleCollectionTypesFilter = useCallback(
    (e) => {
      setSelectedCollectionTypes(
        connectorSource.collectionTypes.filter((v) =>
          v.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    },
    [connectorSource]
  );

  const getStream = useCallback(
    (index: number) => {
      return (
        form.getFieldsValue().collections?.[index] ??
        initialValues.collections[index]
      );
    },
    [initialValues.collections, form]
  );

  const getFormErrors = useCallback(
    (index: number) => {
      let fields = connectorSource.collectionParameters.map((v) => [
        'collections',
        index,
        'parameters',
        v.id
      ]);
      fields.push(['collections', index, 'name']);
      return form.getFieldsError(fields).filter((v) => v.errors.length > 0);
    },
    [form, connectorSource]
  );

  const getCollectionParametersForType = useCallback(
    (type: string) => {
      return connectorSource.collectionParameters?.filter(
        ({ applyOnlyTo }: CollectionParameter) =>
          !applyOnlyTo || applyOnlyTo === type
      );
    },
    [connectorSource.collectionParameters]
  );

  const getCollectionParameters = useCallback(
    (index: number) => {
      return getCollectionParametersForType(getStream(index).type);
    },
    [getCollectionParametersForType, getStream]
  );

  const generateReportNameForType = useCallback(
    (type: string) => {
      const formValues = form.getFieldsValue();
      const collections = formValues?.collections ?? [{}];
      const blankName = type;
      const reportNames =
        collections?.reduce(
          (accumulator: string[], current: CollectionSource) => {
            if (current?.name?.includes(blankName)) {
              accumulator.push(current.name);
            }
            return accumulator;
          },
          []
        ) || [];
      return getUniqueAutoIncId(blankName, reportNames);
    },
    [form]
  );

  const addNewOfType = useCallback(
    (type: string, operation: FormListOperation) => {
      let newCollection = {
        name: generateReportNameForType(type),
        type: type,
        parameters: {},
        _id: randomId()
      };
      for (const param of getCollectionParametersForType(type)) {
        if (param.defaultValue) {
          newCollection.parameters[param.id] = param.defaultValue;
        }
      }
      operation.add(newCollection, 0);
      setActivePanel(activePanel.concat(newCollection._id));
      handleTouchAnyField();
    },
    [
      handleTouchAnyField,
      connectorSource.collectionTemplates,
      activePanel,
      setActivePanel
    ]
  );

  const remove = useCallback(
    (index: number, operation: FormListOperation) => {
      const stream = getStream(index);
      const keyToRemove = stream._id ?? stream.name;
      operation.remove(index);
      setActivePanel(activePanel.filter((v) => v !== keyToRemove));
      handleTouchAnyField();
    },
    [handleTouchAnyField, activePanel, setActivePanel, getStream]
  );

  const handleApplyTemplate = useCallback(
    (chosenTemplate: number, operation: FormListOperation) => {
      if (chosenTemplate >= 0) {
        let newActivePanel = activePanel;
        let template = connectorSource.collectionTemplates[chosenTemplate];
        for (const col of template.collections) {
          let copy = JSON.parse(JSON.stringify(col));
          if (copy.name) {
            copy.name = generateReportNameForType(copy.name);
          } else {
            copy.name = generateReportNameForType(copy.type);
          }
          copy._id = randomId();
          operation.add(copy, 0);
          newActivePanel = newActivePanel.concat(copy._id);
        }
        setActivePanel(newActivePanel);
        handleTouchAnyField();
      }
    },
    [
      connectorSource.collectionTemplates,
      activePanel,
      setActivePanel,
      handleTouchAnyField
    ]
  );

  const handleTouchParameter = useCallback(
    (index: number, e: ChangeEvent<HTMLInputElement>) => {
      const formValues = form.getFieldsValue();
      const collections = formValues.collections;
      const stream = collections[index];
      if (typeof stream._id === 'undefined') {
        stream._id = input.current.state.value;
      }
      form.setFieldsValue({ collections });
      handleTouchAnyField();
    },
    [form, handleTouchAnyField, activePanel, setActivePanel, input]
  );

  return (
    <Form
      name="source-collections"
      form={form}
      initialValues={initialValues}
      autoComplete="off"
      onChange={handleTouchAnyField}
    >
      <Form.List name="collections">
        {(fields: FormListFieldData[], operation: FormListOperation, meta) => (
          <>
            <Row className={'pb-3'}>
              <Col>
                {renderAddButton && (
                  <Button
                    size="large"
                    className="mr-4"
                    onClick={() =>
                      addNewOfType(
                        connectorSource.collectionTypes[0] ?? 'default',
                        operation
                      )
                    }
                    icon={<PlusOutlined />}
                  >
                    Add new stream
                  </Button>
                )}
                {renderAddPopover && (
                  <Popover
                    placement="rightTop"
                    visible={addStreamVisible}
                    onVisibleChange={setAddStreamVisible}
                    content={
                      <>
                        {connectorSource.collectionTypes.length > 7 && (
                          <Input
                            allowClear={true}
                            onChange={handleCollectionTypesFilter}
                            placeholder={'Type to search'}
                          />
                        )}
                        <div
                          className={styles.templates}
                          style={{ maxHeight: '400px' }}
                        >
                          {selectedCollectionTypes.map((type: string) => (
                            <div key={type} className={styles.template}>
                              <div
                                onClick={() => {
                                  addNewOfType(type, operation);
                                  setAddStreamVisible(false);
                                }}
                              >
                                <p className="font-bold">{type}</p>
                              </div>
                              <Button
                                className={styles.button}
                                type="primary"
                                onClick={() => {
                                  addNewOfType(type, operation);
                                  setAddStreamVisible(false);
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    }
                    trigger="click"
                  >
                    <Button
                      size="large"
                      className="mr-4"
                      icon={<PlusOutlined />}
                    >
                      Add new stream
                    </Button>
                  </Popover>
                )}
                {renderApplyTemplates && (
                  <>
                    <Popover
                      placement="rightTop"
                      visible={addTemplateVisible}
                      onVisibleChange={setAddTemplateVisible}
                      content={
                        <div className={styles.templates}>
                          {connectorSource.collectionTemplates.map(
                            (template: CollectionTemplate, index) => (
                              <div
                                key={template.templateName}
                                className={styles.template}
                              >
                                <div>
                                  <p className="font-bold capitalize">
                                    {template.templateName}
                                  </p>
                                  {template.description && (
                                    <p className={styles.comment}>
                                      {template.description}
                                    </p>
                                  )}
                                  <p>
                                    Streams:{' '}
                                    <span className={styles.comment}>
                                      {template.collections
                                        .map<React.ReactNode>((s) => (
                                          <>{s.name ?? s.type}</>
                                        ))
                                        .reduce((prev, curr) => [
                                          prev,
                                          ', ',
                                          curr
                                        ])}
                                    </span>
                                  </p>
                                </div>
                                <Button
                                  type="primary"
                                  className={styles.button}
                                  onClick={() => {
                                    handleApplyTemplate(index, operation);
                                    setAddTemplateVisible(false);
                                  }}
                                >
                                  Apply
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      }
                      trigger="click"
                    >
                      <Button className="mr-4" size={'large'}>
                        Use template
                      </Button>
                    </Popover>
                  </>
                )}
              </Col>
            </Row>
            <Collapse
              activeKey={activePanel}
              onChange={(v) => setActivePanel(v as string[])}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
            >
              {fields.map((field: FormListFieldData) => {
                return (
                  <Panel
                    key={
                      getStream(field.name)._id ?? getStream(field.name).name
                    }
                    header={
                      <div className={'grid grid-cols-3'}>
                        <div className={'whitespace-nowrap'}>
                          Name:&nbsp;&nbsp;<b>{getStream(field.name).name}</b>
                        </div>
                        <div className={'whitespace-nowrap'}>
                          Type:&nbsp;&nbsp;<b>{getStream(field.name).type}</b>
                        </div>
                        <div className={'text-right pr-8'}>
                          {getFormErrors(field.name).length > 0 && (
                            <span style={{ color: 'red' }}>
                              {' '}
                              {getFormErrors(field.name).length} errors
                            </span>
                          )}
                        </div>
                      </div>
                    }
                    extra={
                      <DeleteOutlined
                        className={styles.delete}
                        onClick={(event) => {
                          remove(field.name, operation);
                          event.stopPropagation();
                        }}
                      />
                    }
                  >
                    <div className={styles.item} key={field.name}>
                      <>
                        <Row>
                          <Col span={16}>
                            <Form.Item
                              className="form-field_fixed-label"
                              label={
                                <LabelWithTooltip
                                  documentation={
                                    <>
                                      Will be used as table name prefixed with
                                      source_id. Table name will be:
                                      <br />
                                      <CodeInline>
                                        {initialValues.sourceId}_
                                        <b>
                                          {getStream(field.name).name ??
                                            '[Name]'}
                                        </b>
                                      </CodeInline>
                                    </>
                                  }
                                  render={<>Name:</>}
                                />
                              }
                              name={[field.name, 'name']}
                              rules={[
                                {
                                  required: true,
                                  message:
                                    'Field is required. You can remove this collection.'
                                },
                                {
                                  validator: (rule: any, value: string) => {
                                    const formValues = form.getFieldsValue();
                                    const isError = formValues.collections
                                      .map(
                                        (collection, index) =>
                                          index !== field.name &&
                                          collection.name
                                      )
                                      .includes(value);

                                    return isError
                                      ? Promise.reject(
                                          'Must be unique under the current collection'
                                        )
                                      : Promise.resolve();
                                  }
                                }
                              ]}
                              labelCol={{ span: 6 }}
                              wrapperCol={{ span: 18 }}
                            >
                              <Input
                                autoComplete="off"
                                ref={input}
                                onChange={(e) =>
                                  handleTouchParameter(field.name, e)
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        {getCollectionParameters(field.name).map(
                          (collection: CollectionParameter) => (
                            <SourceFormCollectionsField
                              documentation={collection.documentation}
                              field={field}
                              key={collection.id}
                              collection={collection}
                              handleFormFieldsChange={handleTouchAnyField}
                            />
                          )
                        )}
                      </>
                    </div>
                  </Panel>
                );
              })}
            </Collapse>
          </>
        )}
      </Form.List>
    </Form>
  );
};
SourceEditorStreams.displayName = "SourceEditorStreams";

export { SourceEditorStreams };
