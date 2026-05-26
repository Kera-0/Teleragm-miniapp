package com.tgapp.access;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "tgapp.access")
public class AccessProperties {

    private List<Long> sellerIds = new ArrayList<>();
    private List<Long> adminIds = new ArrayList<>();

    public List<Long> getSellerIds() {
        return sellerIds;
    }

    public void setSellerIds(List<Long> sellerIds) {
        this.sellerIds = sellerIds;
    }

    public List<Long> getAdminIds() {
        return adminIds;
    }

    public void setAdminIds(List<Long> adminIds) {
        this.adminIds = adminIds;
    }
}
