import _ from "lodash";

export default class ContactProperty {

  findHullGroup(hubspotGroups) {
    return _.find(hubspotGroups, g => g.name === "hull");
  }

  findHullProperty(hubspotHullGroup) {
    return _.find(_.get(hubspotHullGroup, "properties"), p => p.name === "hull_segments");
  }

  getHullGroup() {
    return {
      name: "hull",
      displayName: "Hull Properties",
      displayOrder: 1
    };
  }

  getHullProperty(segments = []) {
    const options = _.map(segments, (s, i) => this.optionsHash(s.name, i));
    return {
      options,
      description: "All the Segments the User belongs to in Hull",
      label: "Hull Segments",
      groupName: "hull",
      fieldType: "checkbox",
      formField: false,
      name: "hull_segments",
      type: "enumeration",
      displayOrder: 0
    };
  }

  optionsHash(name, i) {
    return {
      hidden: false,
      description: null,
      value: _.trim(name),
      readOnly: false,
      doubleData: 0.0,
      label: name,
      displayOrder: i
    };
  }
}
